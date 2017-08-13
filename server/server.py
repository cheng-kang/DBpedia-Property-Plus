import tornado.ioloop
import tornado.web
import requests
import json
import urllib
import re
import nltk
import time
from operator import itemgetter
# !!py_mini_racer requires Linux/OSX enviroment
from py_mini_racer import py_mini_racer

# 
# !!IMPORTANT!!
# Setup your own stanford corenlp server, 
# then change the url below.
#
STANFORD_CORENLP_SERVER_URL = "http://localhost:9000/"
STANFORD_CORENLP_API_URL = STANFORD_CORENLP_SERVER_URL + "?properties=%7B%22annotators%22%3A%20%22tokenize%2Cssplit%2Cparse%2Cdepparse%22%7D&pipelineLanguage=en"

class BaseHandler(tornado.web.RequestHandler):
  def set_default_headers(self):
    # print "setting headers!!!"
    self.set_header("Access-Control-Allow-Origin", "*")
    self.set_header("Access-Control-Allow-Headers", "x-requested-with, origin, content-type, accept, x-auth-token, x-crsf-token")
    self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

  def options(self):
    # no body
    self.set_status(204)
    self.finish()

class MainHandler(tornado.web.RequestHandler):
  def get(self):
    self.write("DBpedia Property+")

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
    print "var fun = (data, rawData) => {"+recipe+"};"
    print data
    print rawData
    try:
      result = ctx.call("fun", data, rawData)
      self.write(json.dumps({"result": result}))
    except:
      self.write(json.dumps({"error": "Please check your recipe."}))
    return

class ParserHandler(BaseHandler):
  def get(self):
    self.write("Stanford Parser. \nPlease use POST request.")

  def post(self):
    s = self.get_argument("string", default=None, strip=False)
    if not s:
      self.clear()
      self.set_status(400)
      self.finish(json.dumps({"error": "Invalid Arguments."}))
      return
    url = STANFORD_CORENLP_API_URL
    data = s
    r = requests.post(url, data=data)
    # print r.text
    self.write(r.text)
    return

class EntryHandler(BaseHandler):
  def get(self):
    self.write("Entry Extraction. \nPlease use POST request.")

  def post(self):
    s = self.get_argument("string", default=None, strip=False)
    if not s:
      self.clear()
      self.set_status(400)
      self.finish(json.dumps({"error": "Invalid Arguments."}))
      return
    url = STANFORD_CORENLP_API_URL
    data = s
    r = requests.post(url, data=data)
    parsed_data = json.loads(r.text)['sentences'][0]['parse']
    parsed_data = parsed_data.replace('\\r', '').replace('\\n', '\n')
    parsed_tree = nltk.Tree.fromstring(parsed_data)
    np_mwe_nocomma = [j for j in [" ".join(i.leaves()) for i in parsed_tree.subtrees() if i.label() == 'NP'] if j.count(' ') > 0 and j.count(',') == 0]

    entries = []
    for i in sorted(np_mwe_nocomma, key=len, reverse=True):
      flag = True
      for j in entries:
        if i in j:
          flag = False
          break
      if flag:
        entries.append(i)

    result = []
    for item in entries:
      url = STANFORD_CORENLP_API_URL
      data = item
      r = requests.post(url, data=data)
      result.append({
        "entry": item,
        "pairs": self.process(item, json.loads(r.text))
        })
      time.sleep(0.2)
    self.write(json.dumps(result))
    return

  def process(self, sent, parsed_data):
    def find_compound(idx):
      result = tokens[idx-1]["word"]
      compound = []
      for item in enhancedDependencies:
        if item["dep"] == "compound" and item["governor"] == idx:
          compound.append(item["dependent"])

      for item in sorted(compound, reverse=True):
        result = tokens[item-1]["word"] + " " + result

      return result

    nmod_of_list = []
    nmod_poss_list = []
    amod_list = []
    pairs = []

    enhancedDependencies = parsed_data["sentences"][0]["enhancedDependencies"]
    tokens = parsed_data["sentences"][0]["tokens"]

    for item in enhancedDependencies:
      dep = item["dep"]
      if dep == "nmod:of":
        nmod_of_list.append(item)
        continue
      if dep == "nmod:poss":
        nmod_poss_list.append(item)
        continue
      if dep == "amod":
        amod_list.append(item)

    if len(nmod_of_list) > 0:
      nmod_of = sorted(nmod_of_list, key=itemgetter("governor"))[0]
      pairs.append({
        "entity": sent[tokens[nmod_of["governor"]-1]["characterOffsetEnd"]+4:],
        "property": find_compound(nmod_of["governor"])
        })
    if len(nmod_poss_list) > 0:
      nmod_poss = sorted(nmod_poss_list, key=itemgetter("governor"))[-1]
      pairs.append({
        "entity": sent[:tokens[nmod_poss["governor"]-1]["characterOffsetBegin"]-3],
        "property": find_compound(nmod_poss["governor"])
        })
    if len(nmod_of_list) == 0 and len(nmod_poss_list) == 0 and len(amod_list) > 0:
      amod = amod_list[0]
      pairs.append({
        "entity": sent,
        "property": find_compound(amod["governor"])
        })

    if len(pairs) == 0:
      page_name = self.get_dbpedia_page(sent)
      page_properties = self.get_dbpedia_page_property_list(page_name)
      print page_name
      newPair = {
        "entity": sent,
        "property": "abstract",
        "pageName": page_name,
        "pageData": page_properties
      }
      return [newPair]

    for item in pairs:
      page_name = self.get_dbpedia_page(item["entity"])
      page_properties = self.get_dbpedia_page_property_list(page_name)
      print page_name
      item["pageName"] = page_name
      item["pageData"] = page_properties
      time.sleep(0.3)

    return pairs


  def get_dbpedia_page(self, entity_name):
    print 'Getting DBpedia page of ' + entity_name
    uri = 'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=' + entity_name + '&srprop=&srlimit=3'
    try:
      res = requests.get(uri)
    except requests.ConnectionError:
      return "Connection Error" 
    data = json.loads(res.text)
    if 'suggestion' in data['query']['searchinfo']:
      return self.get_dbpedia_page(data['query']['searchinfo']['suggestion'])
    else:
      return data['query']['search'][0]['title']

  def get_dbpedia_page_property_list(self, page_name):
    print 'Getting DBpedia page properties of ' + page_name
    f_page_name = page_name.replace(" ","_")
    # uri = 'http://dbpedia.org/data/' + f_page_name + '.json'
    uri = 'http://live.dbpedia.org/data/' + f_page_name + '.json'
    print uri
    try:
      res = requests.get(uri)
    except requests.ConnectionError:
      return "Connection Error"
    data = json.loads(res.text)
    # key = 'http://dbpedia.org/resource/' + f_page_name
    base_url = 'http://live.dbpedia.org'
    key = 'http://live.dbpedia.org/resource/' + f_page_name

    def camel_case_split(identifier):
      matches = re.finditer('.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)', identifier)
      return ' '.join([m.group(0).lower() for m in matches])

    def get_property_name(url):
      skip_url_list = [
        base_url+'/property/citizenship',
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
        ]
      if url in skip_url_list:
        return 'row'
      property_name = url.rsplit('/', 1)[-1]
      property_name = property_name.rsplit('#', 1)[-1]
      return 'row' if property_name[:3] == 'row' or property_name[:8] == 'wikiPage' else camel_case_split(property_name)
    properties = {get_property_name(key): value for key, value in data[key].iteritems()}
    properties.pop('row', None)
    return properties

def make_app():
  return tornado.web.Application([
    (r"/", MainHandler),
    (r"/custom", CustomResultHandler),
    (r"/parser", ParserHandler),
    (r"/entries", EntryHandler)
  ], debug=True)

if __name__ == "__main__":
  app = make_app()
  app.listen(8888, address='0.0.0.0')
  tornado.ioloop.IOLoop.current().start()