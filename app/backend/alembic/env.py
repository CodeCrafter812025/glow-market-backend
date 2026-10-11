#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Desc   :

import asyncio
import importlib
import os
import pkgutil
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine


def clear_backend_import_cache():
    roots = ("core.database", "models")
    prefixes = tuple(f"{root}." for root in roots)
    for module_name in list(sys.modules):
        if module_name in roots or module_name.startswith(prefixes):
            sys.modules.pop(module_name, None)
    importlib.invalidate_caches()


clear_backend_import_cache()
from core.database import Base
import models

# Automatically import all ORM models under Models
for _, module_name, _ in pkgutil.iter_modules(models.__path__):
    importlib.import_module(f"{models.__name__}.{module_name}")

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def alembic_include_object(object, name, type_, reflected, compare_to):
    # type_ can be 'table', 'index', 'column', 'constraint'
    # ``users`` and ``oidc_states`` are now managed by Alembic (created in the
    # phase1 migration), so they are no longer excluded from autogenerate.
    if type_ == "table" and name in ["sessions"]:
        return False
    return True


async def run_migrations_online():
    # Resolve the target DB from DATABASE_URL first, then fall back to the
    # (historically empty) alembic.ini value, so ``alembic upgrade head`` works
    # without editing alembic.ini.
    database_url = os.environ.get("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
    if not database_url:
        raise RuntimeError("DATABASE_URL must be set (or alembic.ini sqlalchemy.url) to run migrations")

    connectable = create_async_engine(database_url, poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(
            lambda sync_conn: context.configure(
                connection=sync_conn,
                target_metadata=target_metadata, render_as_batch=True,
                compare_type=True,
                compare_server_default=True,
                include_object=alembic_include_object,
            )
        )
        async with connection.begin():
            await connection.run_sync(lambda sync_conn: context.run_migrations())
    await connectable.dispose()


def run_migrations():
    try:
        # If there is no event loop currently, use asyncio.run directly
        loop = asyncio.get_running_loop()
        loop.create_task(run_migrations_online())
    except RuntimeError:
        asyncio.run(run_migrations_online())


run_migrations()
