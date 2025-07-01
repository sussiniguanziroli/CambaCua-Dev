// This file defines your store's operating hours and checks if it's currently open.
// All times are in Argentina local time (UTC-3).

const businessHours = {
    // Monday (1) to Friday (5)
    weekday: [
        { open: 9, close: 9.5 }, // Morning shift (9:00 AM to 12:30 PM)
        { open: 17, close: 21 }  // Evening shift (5:00 PM to 9:00 PM)
    ],
    // Saturday (6)
    saturday: { open: 9, close: 13 },
    // Sunday (0) is closed
};

export const isStoreOpen = () => {
    // Get current date and time adjusted for Argentina's timezone (UTC-3)
    const now = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
    const dayOfWeek = now.getUTCDay(); // Sunday = 0, Monday = 1, etc.
    // Get the hour as a decimal (e.g., 9:30 AM becomes 9.5)
    const currentHour = now.getUTCHours() + now.getUTCMinutes() / 60;

    if (dayOfWeek === 0) { // Sunday
        return false;
    }

    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        // Check if the current time falls into any of the weekday shifts
        return businessHours.weekday.some(shift => 
            currentHour >= shift.open && currentHour < shift.close
        );
    }

    if (dayOfWeek === 6) { // Saturday
        return currentHour >= businessHours.saturday.open && currentHour < businessHours.saturday.close;
    }

    return false;
};
