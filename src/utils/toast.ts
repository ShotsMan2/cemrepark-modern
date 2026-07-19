import Swal, { SweetAlertIcon } from 'sweetalert2';

// Enterprise Toast Configuration
const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  customClass: {
    popup: 'bg-white/95 dark:bg-[#1a1016]/95 backdrop-blur-md border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl',
    title: 'text-sm font-medium text-gray-900 dark:text-white ml-2',
    icon: 'scale-75',
    timerProgressBar: 'bg-gradient-to-r from-primary to-secondary h-1',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const showToast = (title: string, icon: SweetAlertIcon = 'success') => {
  return Toast.fire({
    icon,
    title
  });
};

export const showErrorToast = (title: string) => {
  return showToast(title, 'error');
};

export const showInfoToast = (title: string) => {
  return showToast(title, 'info');
};

export const showWarningToast = (title: string) => {
  return showToast(title, 'warning');
};
