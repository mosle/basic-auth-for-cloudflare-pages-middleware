type Credentials = {
  name: string;
  password: string;
};
const parse = (string: string | undefined | null): Credentials | undefined => {
  if (string == undefined || string == null) return;
  const matched = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/.exec(string);
  if (!matched) {
    return undefined;
  }
  const userPass = /^([^:]*):(.*)$/.exec(atob(matched[1]));
  if (!userPass) {
    return undefined;
  }
  return { name: userPass[1], password: userPass[2] };
};

const unauthorized = (body: string): Response => {
  return new Response(body, {
    status: 401,
    statusText: "'Authentication required.'",
    headers: {
      "WWW-Authenticate": 'Basic realm="User Visible Realm"',
    },
  });
};

const createBasicAuthHandler = (authInfo: Credentials, unauthorizedText: string = "Authentication required."): PagesFunction => {
  return async ({ request, next }) => {
    const credentials = parse(request.headers.get("Authorization"));
    if (!credentials || credentials.name !== authInfo.name || credentials.password !== authInfo.password) {
      return unauthorized(unauthorizedText);
    }
    return await next();
  };
};

export default createBasicAuthHandler;
