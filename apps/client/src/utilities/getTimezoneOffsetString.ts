export const getTimezoneOffsetString: () => string = () => {
    const offsetMinutes = new Date().getTimezoneOffset();
    
    // Convert offset to hours and minutes
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    
    // Construct the UTC offset string
    const offsetString = (offsetMinutes >= 0 ? '-' : '+') +
        ('0' + hours).slice(-2) + ':' +
        ('0' + minutes).slice(-2);
    return offsetString;
}
