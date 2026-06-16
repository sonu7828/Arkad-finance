/**
 * Calculates the number of days until or since a due date.
 * @param {string|Date} dueDate - The due date to compare against today.
 * @returns {string} - A human-readable string indicating the status of the due date.
 */
export const getDueDateCounter = (dueDate) => {
  if (!dueDate || typeof dueDate !== 'string' || ['Pending', 'Processing', 'N/A', ''].includes(dueDate)) {
    return 'No due date';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  // Ensure the date is valid
  if (isNaN(due.getTime())) {
    return 'No due date';
  }
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays > 0) {
    return `Due in ${diffDays} days`;
  } else {
    return `${Math.abs(diffDays)} days overdue`;
  }
};

/**
 * Formats a date string or object to DD/MM/YYYY.
 * @param {string|Date} date - The date to format.
 * @returns {string} - The formatted date or 'N/A'.
 */
export const formatDateDDMMYYYY = (date) => {
  if (!date || date === 'Pending' || date === 'Processing' || date === 'N/A') {
    return 'N/A';
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return 'N/A';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};
