import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches rendering errors anywhere in the tree and shows a readable Persian
 * fallback UI instead of a blank white screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    let message = 'خطای غیرمنتظره در نمایش صفحه';
    if (error instanceof Error && error.message) {
      message = error.message;
    } else if (typeof error === 'string' && error.trim()) {
      message = error;
    }
    return { hasError: true, message: message.slice(0, 300) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4"
      >
        <div className="w-full max-w-md rounded-2xl border border-rose-100 bg-white p-6 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-rose-900 font-vazirmatn">
            مشکلی در نمایش این بخش پیش آمد
          </h2>
          <p className="mb-4 text-sm text-muted-foreground font-vazirmatn">
            نگران نباشید، اطلاعات شما از دست نرفته است. می‌توانید دوباره تلاش کنید.
          </p>
          <p className="mb-5 break-words rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600" dir="ltr">
            {this.state.message}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
            >
              <RotateCcw className="h-4 w-4" />
              تلاش مجدد
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
            >
              <Home className="h-4 w-4" />
              بازگشت به خانه
            </button>
          </div>
        </div>
      </div>
    );
  }
}