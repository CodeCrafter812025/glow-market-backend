import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.sellers import SellersService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/sellers", tags=["sellers"])


# ---------- Pydantic Schemas ----------
class SellersData(BaseModel):
    """Entity data schema (for create/update)

    Only `brand_name` is required. Every other field is genuinely optional at the
    validation layer: an omitted key, an explicit `null`, or an empty string are
    all accepted. Empty strings are normalized to `None` so nullable DB columns
    stay clean instead of storing "".
    """
    brand_name: str
    is_founder: Optional[bool] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    logo_url: Optional[str] = None
    bio: Optional[str] = None

    @field_validator("contact_phone", "contact_email", "logo_url", "bio", mode="before")
    @classmethod
    def empty_string_to_none(cls, value):
        """Treat blank/whitespace-only optional text as NULL."""
        if isinstance(value, str) and not value.strip():
            return None
        return value


class SellersUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    brand_name: Optional[str] = None
    is_founder: Optional[bool] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    logo_url: Optional[str] = None
    bio: Optional[str] = None


class SellersResponse(BaseModel):
    """Entity response schema"""
    id: int
    brand_name: str
    is_founder: Optional[bool] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    logo_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SellersListResponse(BaseModel):
    """List response schema"""
    items: List[SellersResponse]
    total: int
    skip: int
    limit: int


class SellersBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[SellersData]


class SellersBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: SellersUpdateData


class SellersBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[SellersBatchUpdateItem]


class SellersBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=SellersListResponse)
async def query_sellerss(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query sellerss with filtering, sorting, and pagination"""
    logger.debug(f"Querying sellerss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = SellersService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} sellerss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid sellers query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying sellerss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=SellersListResponse)
async def query_sellerss_all(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query sellerss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying sellerss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = SellersService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} sellerss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid sellers query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying sellerss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=SellersResponse)
async def get_sellers(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single sellers by ID"""
    logger.debug(f"Fetching sellers with id: {id}, fields={fields}")
    
    service = SellersService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Sellers with id {id} not found")
            raise HTTPException(status_code=404, detail="Sellers not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sellers {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=SellersResponse, status_code=201)
async def create_sellers(
    data: SellersData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new sellers"""
    logger.debug(f"Creating new sellers with data: {data}")
    
    service = SellersService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create sellers")
        
        logger.info(f"Sellers created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating sellers: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating sellers: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[SellersResponse], status_code=201)
async def create_sellerss_batch(
    request: SellersBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple sellerss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} sellerss")
    
    service = SellersService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} sellerss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[SellersResponse])
async def update_sellerss_batch(
    request: SellersBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple sellerss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} sellerss")
    
    service = SellersService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} sellerss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=SellersResponse)
async def update_sellers(
    id: int,
    data: SellersUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing sellers"""
    logger.debug(f"Updating sellers {id} with data: {data}")

    service = SellersService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Sellers with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Sellers not found")
        
        logger.info(f"Sellers {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating sellers {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating sellers {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_sellerss_batch(
    request: SellersBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple sellerss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} sellerss")
    
    service = SellersService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} sellerss successfully")
        return {"message": f"Successfully deleted {deleted_count} sellerss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_sellers(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single sellers by ID"""
    logger.debug(f"Deleting sellers with id: {id}")
    
    service = SellersService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Sellers with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Sellers not found")
        
        logger.info(f"Sellers {id} deleted successfully")
        return {"message": "Sellers deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting sellers {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")