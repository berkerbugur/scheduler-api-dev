const {addDays, differenceInDays} = require('date-fns')

const transformSchedule = (data) => {
    const { startDate, endDate, schedule } = data
    const parsedStartDate = new Date(startDate)
    const parsedEndDate = new Date(endDate)

    const extendedSchedule = {}
    const totalDays = differenceInDays(parsedEndDate, parsedStartDate) + 1
    const patterns = Object.entries(schedule)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([_, timeSlots]) => timeSlots)

    for (let i = 0; i < totalDays; i++) {
        const currentDate = addDays(parsedStartDate, i)
        const dateStr = currentDate.toString()
        const patternIndex = i % patterns.length
        extendedSchedule[dateStr] = patterns[patternIndex]
    }

    return extendedSchedule
}

module.exports = {
    transformSchedule
}