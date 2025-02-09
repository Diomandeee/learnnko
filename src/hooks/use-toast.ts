// src/hooks/use-toast.ts (or any other appropriate location in your project)

import { toast } from "react-toastify"; // Make sure react-toastify is installed

export const useToast = () => {
  return {
    toast: ({
      title,
      description,
      variant = "default", // default, destructive, or other custom variants
      duration = 3000, // Duration in milliseconds
    }: {
      title: string;
      description?: string;
      variant?: "default" | "destructive" | string; // Type the variant
      duration?: number;
    }) => {

      const toastOptions = {
        position: "top-right", // You can customize the position
        autoClose: duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }

      switch (variant) {
        case "destructive":
          toast.error(description || title, toastOptions);
          break;
        case "default":
        default:
          toast(description || title, toastOptions); // Default toast
          break;
      }
    },
  };
};