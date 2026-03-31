/**
 * meeting-get-rooms
 * Fetches meeting rooms availability for a given date.
 * Must run in the browser context of a logged-in meeting page.
 *
 * Params:
 *   bookDate       string   date in YYYY-MM-DD format, default today
 *   workplace      string   default '总部大厦'
 *   floor          string   optional floor filter e.g. '20'
 *   meetingType    string   optional type filter e.g. '中会议室'
 *   startHour      number   optional: only return rooms available at this hour (e.g. 16)
 *   endHour        number   optional: only return rooms available through this hour (e.g. 19)
 *
 * Returns rooms with availability info, filtered by params.
 */
async (params) => {
  const {
    bookDate,
    workplace = '总部大厦',
    floor,
    meetingType,
    startHour,
    endHour
  } = params || {}

  try {
    // Determine date
    const dateStr = bookDate || new Date().toISOString().slice(0, 10)
    const bookTime = `${dateStr} 00:00:00`

    // Build URL
    let url = `https://meeting.your-company.com/eoss-meeting/meeting/meetingrooms/getRooms?bookTime=${encodeURIComponent(bookTime)}&workplace=${encodeURIComponent(workplace)}&page=1&limit=999`
    if (floor) {
      url += `&floor=${encodeURIComponent(floor)}`
    }

    const resp = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    })

    if (!resp.ok) return { success: false, error: `HTTP ${resp.status}` }

    const data = await resp.json()
    if (data.code !== 0) {
      return { success: false, error: data.msg || JSON.stringify(data) }
    }

    let rooms = data.data.list || []

    // Client-side filter by meetingType
    if (meetingType) {
      rooms = rooms.filter(r => r.meetingType === meetingType)
    }

    // Process availability: check if requested time slots are all free
    const result = rooms.map(room => {
      const slots = room.meetingInfoMaps || {}
      const slotEntries = []
      let allRequestedFree = true

      for (const [timeKey, value] of Object.entries(slots)) {
        const hour = parseInt(timeKey.split('T')[1].split(':')[0], 10)
        const minute = parseInt(timeKey.split('T')[1].split(':')[1], 10)
        const status = (value !== null && typeof value === 'object') ? 'booked' : 'free'
        const bookedBy = (status === 'booked' && value) ? value.booker : null
        const theme = (status === 'booked' && value) ? value.theme : null

        slotEntries.push({ time: timeKey, hour, minute, status, bookedBy, theme })

        // Check if this slot falls in requested range
        if (startHour !== undefined && endHour !== undefined) {
          const slotHourDecimal = hour + minute / 60
          if (slotHourDecimal >= startHour && slotHourDecimal < endHour) {
            if (status !== 'free') {
              allRequestedFree = false
            }
          }
        }
      }

      return {
        roomId: room.id,
        roomCode: room.roomcode,
        meetingType: room.meetingType,
        capacity: room.capacity,
        equipment: room.equipment,
        floor: room.roomcode ? null : null, // floor info not directly in response
        availableForRequested: (startHour !== undefined && endHour !== undefined) ? allRequestedFree : undefined,
        slots: slotEntries
      }
    })

    // If startHour/endHour specified, sort available rooms first
    let finalResult = result
    if (startHour !== undefined && endHour !== undefined) {
      finalResult = result.filter(r => r.availableForRequested)
    }

    return {
      success: true,
      date: dateStr,
      total: finalResult.length,
      totalBeforeFilter: result.length,
      rooms: finalResult
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
