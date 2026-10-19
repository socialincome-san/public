import { NextResponse, type NextRequest } from "next/server";

export const proxy = (request: NextRequest) => {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    // Der Header enthält "benutzername:passwort" in Base64. Wir prüfen nur das Passwort.
    const decoded = atob(header.slice(6));
    const password = decoded.slice(decoded.indexOf(":") + 1);
    if (password === process.env.APP_PASSWORD) {
      return NextResponse.next();
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Image Generator", charset="UTF-8"',
    },
  });
};

export const config = {
  matcher: ["/((?!_next/static|favicon.ico|images/showcase/).*)"],
};
