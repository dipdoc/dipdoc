#!/usr/bin/env python
# DipDoc - JSDOC + Unit Tests
# Author: Nikola Stamatovic Stamat

#TODO: MODULARIZE(multy language support) AND COMMENT! :P

# $prepare var m1 = ivar.data.Map({something: lol})

# assert can be equal stricEqual deepEqual or true with aditional operator not
# $assert equal this(m1) params('hello', 1) result(true) Some message for information

import sys
import os
import re
import json

import markdown



tags = [{'pref':'@','name':'doc'},
  	{'pref':'\$','name':'unit'}]
data = {}

decl = {}
for tag in tags:
	decl[tag['name']] = {}
	

def asIs(s):
	return s
	
def stripNewline(s):
	return s.strip('\n\r')
	
def stripWhitespace(s):
	return s.strip()

def strip(s):
	return s.strip(' \t\n\r')

def stripCurlyBrackets(s):
	return s.strip('{}')
	
def parseParam(s):
	s = s.strip()
	res = {}
	prop = re.match('^(\{(?P<type>.*)\})(\s|\t)*(?P<name>(\[(\s|\t)*[a-zA-Z_$][a-zA-Z0-9_$.]*(\s|\t)*(=([0-9.]*|(true|false|undefined|null)|(\{.*\})|(\[.*\])|(".*")|(\'.*\')))?(\s|\t)*\])|([a-zA-Z_$][a-zA-Z0-9_$.]*(\s|\t)*(=([0-9.]*|(true|false|undefined|null)|(\{.*\})|(\[.*\])|(".*")|(\'.*\')))?))(\s|\t)*(?P<description>.*)$', s)
	if prop is not None:
		res['type'] = prop.group('type').split('|')
		res['name'] = prop.group('name').strip()
		res['mandatory'] = True
		mand = re.match(r'^\[(.*)\]$', res['name'])
		if mand is not None:
			res['mandatory'] = False
			res['name'] = mand.group(1)
		res['description'] = prop.group('description')
		return res
	return s
	
decl['doc']['param'] = parseParam

def parseReturn(s):
	s = s.strip()
	res = {}
	prop = re.match('^(\{(?P<type>.*)\})(\s|\t)*(?P<description>.*)$', s)
	if prop is not None:
		res['type'] = prop.group('type').split('|')
		res['description'] = prop.group('description')
		return res
	return s
		
decl['doc']['return'] = parseReturn
	
decl['doc']['property'] = parseParam
	
def parseThis(s):
	return stripCurlyBrackets(s.strip())
decl['doc']['this'] = parseThis

decl['doc']['example'] = asIs
decl['doc']['exampledesc'] = stripWhitespace

decl['doc']['description'] = stripWhitespace
decl['doc']['group'] = stripWhitespace
decl['doc']['constructor'] = stripWhitespace

decl['doc']['author'] = stripWhitespace
decl['doc']['copyright'] = stripWhitespace
decl['doc']['licence'] = stripWhitespace
decl['doc']['file'] = stripWhitespace
decl['doc']['namespace'] = stripWhitespace
decl['doc']['version'] = stripWhitespace

decl['doc']['link'] = stripWhitespace
decl['doc']['see'] = stripWhitespace
decl['doc']['depends'] = stripWhitespace #should try to get imports/requires by itself
def parseToDo(s):
	s = s.strip()
	res = {}
	res['complete'] = False
	res['urgent'] = False
	todo = re.match(r'(\[(?P<complete>.*)\])?(\s|\t)*(?P<task>.*)',s)
	if todo is not None:
		res['task'] = todo.group('task')
		if todo.group('complete') is not None:
			c = todo.group('complete').strip()
			if c == 'x' or c == '+' or c == '*':
				res['complete'] = True
			elif c == '!':
				res['urgent'] = True
		return res
	return s
	
decl['doc']['todo'] = parseToDo

decl['unit']['prepare'] = asIs
decl['unit']['assert'] = asIs #TODO: parse assert

lang = {}
lang['js'] = {}

def jsExtract(s):
	s = s.strip()
	res = {}
	#TODO: dont frgt class for other languages 
	if not s:
		return
	
	isComment = re.match(r'^(/\*|//)', s) is not None
	if isComment:
		return
		
	isFn = re.match(r'.*function(\s|\t)*.*(\s|\t)*\(', s)
	isImport = re.match(r'^(import|include|require)(\s|\t)*\((?P<id>.*)\)', s)
	if isFn is not None:
		res['type'] = 'function'
		#args = re.match(r'.*function(\s|\t)*.*(\s|\t)*\((\s|\t)*(?P<args>([a-zA-Z_$][a-zA-Z0-9_$]*(\s|\t)*,(\s|\t)*)*([a-zA-Z_$][a-zA-Z0-9_$]*)?)(\s|\t)*\)(\s|\t)*\{?', s)
		#if args is not None:
		#	res['args'] = args.group('args').split(',')
		proto = re.match(r'^(?P<parent>..*)\.prototype\.(?P<name>..*)(\s|\t)*=', s)
		if proto is not None:
			res['name'] = proto.group('name')
			res['parent'] = proto.group('parent')
			return res
			
		fn = re.match(r'^function(\s|\t)*(?P<name>..*)(\s|\t)*\(', s)
		if fn is not None:
			res['name'] = fn.group('name')
			return res
	
	elif isImport is not None:
		res['type'] = 'dependency'
		res['name'] = isImport.group('id')
		return res
	else:
		res['type'] = 'field'
		
	this = re.match(r'^this\.(?P<name>..*)(\s|\t)*=', s)
	if this is not None:
		res['name'] = this.group('name')
		res['parent'] = 'this'
		return res
		
	var = re.match(r'^var(\s|\t)*(?P<name>..*)(\s|\t)*=', s)
	if var is not None:
		res['name'] = var.group('name')
		return res
		
	other = re.match(r'^(?P<parent>(..*\.)*)(?P<name>..*)(\s|\t)*=', s)
	if other is not None:
		res['name'] = other.group('name')
		if other.group('parent') is not None:
			res['parent'] = other.group('parent')
		return res

lang['js'] = jsExtract

def buildTagParsingRegexp(l):
	res = []
	for i in l:
		res.append('((?P<'+i['name']+'>'+i['pref']+'[\w]+)(?P<'+i['name']+'_rest>.*))');
	return '|'.join(res)

#I know there is too many lines of code but it is fast if this is done in one iteration
def getCommentData(uri, tags, decl, extension='js',pref='/\*', suf='\*/', decor= '\*', sing='//'):
	eset = {'header':{}, 'content':[]}
	reg_str = buildTagParsingRegexp(tags)
	tag_re = re.compile(reg_str)
	strip_re = re.compile("^("+pref+")?"+decor+"+\s?(?P<let_me_see_you_stripped>.*)"+decor+"*("+suf+")?")

	flag = False
	one_more = False
	first = None
	e = {}
	lines = 0
	sloc = 0

	f = open(uri, 'r')
	for line in f:
		lines += 1
		
		stripped = line.strip()

		start = re.match('^'+pref+'(.*)', stripped)
		if start is not None:
			flag = True;
			e = {}
			for tag in tags:
				e[tag['name']] = {}

			tag_name = None
			tp = None
		
		#each code line
		single = re.match('^'+sing, stripped)
		if single is None:
			if flag and one_more:
				sloc += 1
			elif not flag and stripped != '':
				sloc += 1

		end = re.match('(.*)'+suf+'$', stripped)
		if end is not None:
			stripped = end.group(1)
			
		#each multiline comment line
		if flag and not one_more:

			st = strip_re.match(stripped)
			if st is not None:
				stripped = st.group('let_me_see_you_stripped') #rammstein version
			else:
				if start is not None:
					stripped = start.group(1)
				elif end is not None:
					stripped = end.group(1)
				else:
					stripped = line

			if tag_name is None:
				tag_name = 'description'
				tp = 'doc'

			tag_data = parseCommentLine(stripped, tags, tag_re)

			if tag_data is not None and type(tag_data) is dict:
				tp = tag_data['type']
				tag_name = tag_data['name']	

			if tag_name not in e[tp]:
				e[tp][tag_name] = []
			if tag_data is not None and type(tag_data) is dict:
				res = None
				if tag_name in decl[tp]:
					res = decl[tp][tag_name](tag_data['rest'])
				if res is not None:
					e[tp][tag_name].append(res)

			else:
				if tag_name in decl[tp]:
					stripped = decl[tp][tag_name](stripped)
				ln = len(e[tp][tag_name])
				if stripped is not None:
					if ln > 0:
						dtype = type(e[tp][tag_name][ln-1])
						if dtype is dict and 'description' in e[tp][tag_name][ln-1] and e[tp][tag_name][ln-1]['description'] is not None:
							e[tp][tag_name][ln-1]['description']+='\n'+stripped
						elif dtype is str:	
							e[tp][tag_name][ln-1]+= '\n'+stripped
					else:
						e[tp][tag_name].append(stripped)

		#On last line, that usualy contains the function, class or field related to the documentation
		if one_more:

			if 'doc' in e and 'description' in e['doc']:
				for i, el in enumerate(e['doc']['description']):
					e['doc']['description'][i] = e['doc']['description'][i].strip('\n')
				e['doc']['excerpt'] = e['doc']['description'][0].split('\n')[0]

			if first is None and e is not None and 'doc' in e and e['doc'] is not None:
				first = e['doc']
			if not eset['header']:
				if e is not None and 'doc' in e:
					for tag in e['doc']:
						if 'file' in tag:
							eset['header'] = e['doc'];
							e = None
							break

			fn_info = lang[extension](stripped)
			if fn_info is not None and 'name' in fn_info:
				for f in fn_info:
					e[f] = fn_info[f]
			else:
				e = None

			if flag and e is not None:
				eset['content'].append(e)


			one_more = False
			flag = False


		if end is not None:
			one_more = True;

	if not eset['header'] and first is not None:
		if 'file' not in first and 'name' not in first:
			first['file'] = []
		eset['header'] = first
	
	if 'file' in eset['header']:
		eset['header']['lines'] = lines
		eset['header']['sloc'] = sloc-1
	return eset

def parseCommentLine(line, tags, tag_re):
	res = {
		'type': None,
		'name': None,
		'rest': None
	}
	s = tag_re.match(line)
	if s is not None:
		for tag in tags:
			if s.group(tag['name']) is not None:
				res['type'] = tag['name']
				break
		res['name'] = s.group(res['type'])[1:]
		res['rest'] = s.group(res['type']+'_rest')
		
		return res
	return line

#mdf = open('README.md', 'r')
#md = mdf.read()
#print markdown.markdown(md)

def doFile(root, uri, collector, extension='js'):
	ext = '.'+extension
	print root,uri
	if uri.endswith(ext):
		if not root.endswith(os.sep):
			root += os.sep
		iden = '.'.join(uri[len(root):-len(ext)].split(os.sep))
		result = getCommentData(uri, tags, decl, extension)
		if not result['content'] and not result['header']:
			return
		result['header']['uri'] = uri
		result['header']['id'] = iden
		collector[iden] = result

def outputResult(uri, collector):
	f = open(uri, 'w')
	f.write('var dipdoc = '+json.dumps(collector,indent=4))
	f.close()
	
def run(url, lang=['js'], skip=[], exclude_hidden=True):
	
	modskip = []
	for i in skip:
		modskip.append(os.path.join(url, i))
	skip = modskip
	
	res = {}
	
	for ex in lang:
		data = {}
		for root, dirs, files in os.walk(url):
			if exclude_hidden:
				for d in dirs:
					if d.startswith('.'):
						dirs.remove(d)
		
			if root in skip:
				for d in dirs:
					dirs.remove(d)
				continue
			
			for f in files:
				fpath = os.path.join(root, f)
				if fpath in skip:
					continue
				for ex in lang:
					doFile(url, fpath, data, ex)
	
		container = {}
		container['data'] = data
		container['details'] = {}
		container['details']['lang'] = ex
		container['details']['root'] = url
		res[ex] = container
	
	#XXX: only temporary
	outputResult(os.path.join(url, 'dipdoc.json'), res)

def main(argv):
	ln = len(argv)
	if ln == 2:
		run(argv[0], argv[1].split(','))
	elif ln > 2:
		run(argv[0], argv[1].split(','), argv[2].split(','))
	else:
		run(argv[0])

if __name__ == "__main__":
   main(sys.argv[1:])

