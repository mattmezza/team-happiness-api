# team-happiness-api
Just a simple team happiness tool backend for https://github.com/mattmezza/team-happiness

This is a backend for the team happiness tool and it works like this:

- `GET` `/{name}` gets the stats of the `{name}` team
- `PUT` `/{name}/{feeling}` sends the current `{feeling}` (one of `bad`, `great` or `meh`) to the `{name}` team

The server supports `CORS` requests and exposes everything on the `8888` port.


Matteo Merola - <mattmezza@gmail.com>
