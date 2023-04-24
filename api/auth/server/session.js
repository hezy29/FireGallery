function getSessionCookie(req) {
    let cookieName = 'Session_ID'
    let cookieValue = null;

    const cookieString = req.headers.cookie;
    cookieString.split(';').forEach(item => {
      if (item === '') return ;
      
      const temp = item.split('=');
      const name = temp[0].trim();
      const value = temp[1].trim();
      if (name.trim() == cookieName) { cookieValue = value; return ; }
    })
    
    const sessionCookie = cookieName + '=' + cookieValue;
    return sessionCookie;
}


module.exports = { getSessionCookie };
