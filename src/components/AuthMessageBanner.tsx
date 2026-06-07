import { AlertCircle, X } from "lucide-react";

type AuthMessageBannerProps = {
  message: string;
  onDismiss: () => void;
};

const AuthMessageBanner = ({ message, onDismiss }: AuthMessageBannerProps) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 shadow-lg shadow-rose-950/20"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-rose-300" />
      <p className="min-w-0 flex-1 leading-6">{message}</p>
      <button
        type="button"
        aria-label="Dismiss message"
        onClick={onDismiss}
        className="rounded-lg p-1 text-rose-200 transition hover:bg-rose-400/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AuthMessageBanner;
