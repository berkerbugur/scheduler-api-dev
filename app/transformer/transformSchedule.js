const {addDays, differenceInDays, parseISO} = require('date-fns')

const transformSchedule = (data) => {
    const { startDate, endDate, schedule } = data
    const parsedStartDate = parseISO(startDate)
    const parsedEndDate = parseISO(endDate)

    const extendedSchedule = {}
    const totalDays = differenceInDays(parsedEndDate, parsedStartDate) + 1
    const patterns = Object.entries(schedule)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([_, timeSlots]) => timeSlots)

    for (let i = 0; i < totalDays; i++) {
        const currentDate = addDays(parsedStartDate, i)
        const isoDate = currentDate.toISOString()
        const patternIndex = i % patterns.length
        extendedSchedule[isoDate] = patterns[patternIndex]
    }

    return extendedSchedule
}

module.exports = {
    transformSchedule
}