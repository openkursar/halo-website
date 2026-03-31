/**
 * meeting-book-room
 * Books a meeting room via the meeting API.
 * Must run in the browser context of a logged-in meeting page.
 *
 * Params:
 *   roomId         string   required - Room ID from getRooms result
 *   startTime      string   required - e.g. "2026-03-31 16:00:00"
 *   endTime        string   required - e.g. "2026-03-31 19:00:00"
 *   booker         string   required - e.g. "zhangsan(张三)"
 *   bookerDept     string   optional - department, defaults to booker
 *   theme          string   optional - meeting subject, defaults to "{booker}预定的会议室"
 *   description    string   optional - description text
 *   attendees      array    optional - additional attendee usernames
 *
 * Returns: { success: true, bookingId: "..." }
 */
async (params) => {
  const {
    roomId,
    startTime,
    endTime,
    booker,
    bookerDept,
    theme,
    description = '',
    attendees = []
  } = params || {}

  if (!roomId) return { success: false, error: 'roomId is required' }
  if (!startTime) return { success: false, error: 'startTime is required' }
  if (!endTime) return { success: false, error: 'endTime is required' }
  if (!booker) return { success: false, error: 'booker is required' }

  try {
    const meetingAttendees = [
      { attendeeType: 1, meetingAttendee: booker, needNotice: 1 }
    ]

    // Add extra attendees
    if (attendees && attendees.length > 0) {
      for (const a of attendees) {
        meetingAttendees.push({
          attendeeType: 1,
          meetingAttendee: a,
          needNotice: 1
        })
      }
    }

    const body = {
      booker,
      bookerDept: bookerDept || booker,
      roomId,
      startTime,
      endTime,
      theme: theme || `${booker}预定的会议室`,
      meetingAttendees,
      meetingAttachment: [],
      needHidden: 0,
      description
    }

    const resp = await fetch('https://meeting.your-company.com/eoss-meeting/meeting/meetinginfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    })

    if (!resp.ok) return { success: false, error: `HTTP ${resp.status}` }

    const data = await resp.json()
    if (data.code !== 0) {
      return { success: false, error: data.msg || JSON.stringify(data) }
    }

    return {
      success: true,
      bookingId: data.data,
      roomId,
      startTime,
      endTime,
      theme: body.theme
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
