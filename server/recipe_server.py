import tornado.ioloop
import tornado.web
import json
import urllib
from py_mini_racer import py_mini_racer

class BaseHandler(tornado.web.RequestHandler):
  def set_default_headers(self):
    self.set_header("Access-Control-Allow-Origin", "*")
    self.set_header("Access-Control-Allow-Headers", "x-requested-with, origin, content-type, accept, x-auth-token, x-crsf-token")
    self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

  def options(self):
    self.set_status(204)
    self.finish()

class MainHandler(tornado.web.RequestHandler):
  def get(self):
    self.write("Server for SWWPS")

class CustomResultHandler(BaseHandler):
  def get(self):
    self.write("Custom Result. \nPlease use POST request.")

  def post(self):
    try:
      rawData = json.loads(self.get_argument("rawData", default=None, strip=False))
      data = json.loads(self.get_argument("data", default=None, strip=False))
      recipe = self.get_argument("recipe", default=None, strip=False)
    except:
      self.clear()
      self.set_status(400)
      self.finish(json.dumps({"error": "Invalid Arguments."}))
      return

    ctx = py_mini_racer.MiniRacer()
    ctx.eval("var fun = (data, rawData) => {"+recipe+"};")
    try:
      result = ctx.call("fun", data, rawData)
      self.write(json.dumps({"result": result}))
    except:
      self.write(json.dumps({"error": "Please check your recipe."}))
    return

def make_app():
  return tornado.web.Application([
    (r"/", MainHandler),
    (r"/custom", CustomResultHandler)
  ], debug=True)

if __name__ == "__main__":
  app = make_app()
  app.listen(8888, address='0.0.0.0')
  tornado.ioloop.IOLoop.current().start()