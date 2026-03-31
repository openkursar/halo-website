/**
 * meeting-get-my-bookings
 * Fetches current user's meeting bookings.
 * Must run in the browser context of a logged-in meeting page.
 *
 * Params:
 *   filterDate     string   optional - only return bookings on this date (YYYY-MM-DD)
 *   filterBooker   string   optional - filter by booker name (substring match)
 *
 * Returns: { success: true, bookings: [...] }
 */
async (params) => {
  const {
    filterDate,
    filterBooker
  } = params || {}

  try {
    const resp = await fetch(
      'https://meeting.your-company.com/eoss-meeting/meeting/meetinginfo/getMeetingInfo?limit=1000&page=1&orderField=start_time&order=asc',
      {
        method: 'GET',
        credentials: 'include'
      }
    )

    if (!resp.ok) return { success: false, error: `HTTP ${resp.status}` }

    const data = await resp.json()
    if (data.code !== 0) {
      return { success: false, error: data.msg || JSON.stringify(data) }
    }

    let bookings = data.data || []

    // If data is null/empty, return empty list
    if (!bookings || !Array.isArray(bookings)) {
      // Try data.data.list format
      if (data.data && data.data.list) {
        bookings = data.data.list
      } else {
        return { success: true, total: 0, bookings: [] }
      }
    }

    // Client-side filter by date
    if (filterDate) {
      bookings = bookings.filter(b => {
        const startDate = (b.startTime || '').slice(0, 10)
        return startDate === filterDate
      })
    }

    // Client-side filter by booker
    if (filterBooker) {
      bookings = bookings.filter(b => {
        return (b.booker || '').includes(filterBooker) || (b.creator || '').includes(filterBooker)
      })
    }

    return {
      success: true,
      total: bookings.length,
      bookings: bookings.map(b => ({
        id: b.id,
        roomId: b.roomId,
        roomInfo: b.roomInfo,
        booker: b.booker,
        bookerDept: b.bookerDept,
        theme: b.theme,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        creator: b.creator,
        createDate: b.createDate,
        description: b.description
      }))
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
