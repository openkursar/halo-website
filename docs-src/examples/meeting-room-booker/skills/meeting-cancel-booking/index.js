/**
 * meeting-cancel-booking
 * Cancels/releases a meeting room booking.
 * Must run in the browser context of a logged-in meeting page.
 *
 * Params:
 *   bookingId      string   required - Booking ID to cancel
 *
 * Returns: { success: true, bookingId: "..." }
 */
async (params) => {
  const { bookingId } = params || {}

  if (!bookingId) return { success: false, error: 'bookingId is required' }

  try {
    const resp = await fetch('https://meeting.your-company.com/eoss-meeting/meeting/meetinginfo/releaseOrCancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: bookingId })
    })

    if (!resp.ok) return { success: false, error: `HTTP ${resp.status}` }

    const data = await resp.json()
    if (data.code !== 0) {
      return { success: false, error: data.msg || JSON.stringify(data) }
    }

    return {
      success: true,
      bookingId,
      message: '预订已取消'
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
