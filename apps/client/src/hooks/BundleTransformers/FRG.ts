const daysLookup: {[key: string]: string} = {
    Su: 'Sundays',
    Mo: 'Mondays',
    Tu: 'Tuesdays',
    We: 'Wednesdays',
    Th: 'Thursdays',
    Fr: 'Fridays',
    Sa: 'Saturdays'
};

const joinArray = (arr: any[]) => {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr.join(' and ');
    return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
}

const formatTime = (t: string) => {
    const parts = t.split(':');
    const hoursRaw = parseInt(parts[0], 10);
    const ampm = hoursRaw < 12 ? 'AM' : 'PM';
    const hours = hoursRaw === 0 ? 12 : (hoursRaw > 12 ? hoursRaw - 12 : hoursRaw);
    return `${hours}:${parts[1]}${ampm}`;
};

const formatHours = (hours: any) => {
    const days = hours.days.length === 7
	       ? 'Every day'
	       : joinArray(hours.days.map((d: any) => daysLookup[d]));
    const starts = hours.timeStart ? formatTime(hours.timeStart) : null;
    const ends = hours.timeEnd ? formatTime(hours.timeEnd) : null;
    return `${days} ${starts ?? ''}${ends ? '-' + ends : ''}${hours.notes ? ' ' + hours.notes : ''}`;
};


interface Frg {
    bundleName: string,
    communities: string[];
    index: number;
    record: any;
}

export const frg = ({
    bundleName,
    communities,
    record
}: Frg) => {
    const hours = record.hours ? record.hours
    .map(formatHours)
    .map((h: string) => `- ${h}`)
    .join('\n') : '';
    return [
	record.id,
	{
	    canChat: false,
	    communities,
	    details: `${hours}${hours !== '' ? '\n' : ''}${record.notes ?? ''}`,
	ends: null,
	evergreen: true,
	id: record.id,
	location: {
	    address: `${record.streetAddress}, ${record.addressLocality}, ${record.addressRegion} ${record.postalCode}`,
	lat: record.geolocation.coordinates[1],
	lng: record.geolocation.coordinates[0]
	},
	source: 'bundle',
	bundleName: bundleName,
	title: record.name,
	type: 'event'
	}
    ];
}
