/**
 * meeting-get-user-info
 * Fetches current logged-in user info from meeting system.
 * Must run in the browser context of a logged-in meeting page.
 *
 * Returns: { success: true, username: "zhangsan(张三)", deptName: "技术部" }
 */
async (params) => {
  try {
    const resp = await fetch('https://meeting.your-company.com/eoss-meeting/sys/user/info', {
      method: 'GET',
      credentials: 'include'
    })

    if (!resp.ok) return { success: false, error: `HTTP ${resp.status}` }

    const data = await resp.json()
    if (data.code !== 0) {
      return { success: false, error: data.msg || JSON.stringify(data) }
    }

    return {
      success: true,
      username: data.data.username,
      deptName: data.data.deptName,
      workplace: data.data.workplace,
      floor: data.data.floor,
      isBlackList: data.data.blackList
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
