class DateUtil {
    constructor() {

    }

    formatDate(dateValue) {

        let date = new Date(dateValue);
        const day = date.toLocaleString('default', { day: '2-digit' });
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.toLocaleString('default', { year: 'numeric' });
        return day + ' ' + month + ' ' + year;
    }

    isDateToday(dateValue) {
        return dateValue === this.formatDate(Date());
    }
}

module.exports = DateUtil;
