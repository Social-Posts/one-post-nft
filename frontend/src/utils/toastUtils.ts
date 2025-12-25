import { toast } from "sonner";

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

export const showErrorToast = (message: string, error?: any) => {
  const description =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : undefined;

  toast.error(message, {
    description,
    duration: 5000,
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 3000,
  });
};
