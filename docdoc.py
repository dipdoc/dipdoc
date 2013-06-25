# DocDoc - JSDOC + Unit Tests
# Author: Nikola Stamatovic Stamat

#TODO: MODULARIZE(multy language support) AND COMMENT! :P

# $prepare var m1 = ivar.data.Map({something: lol})

# assert can be equal stricEqual deepEqual
# $assert equal this(m1) params('hello', 1) result(true) Some message for information
import re

tags = [{'pref':'@','name':'doc'},
  	{'pref':'\$','name':'unit'}]
data = {}

decl = {}
for tag in tags:
	decl[tag['name']] = {}


def asIs(s):
	return s
	
def stripCurlyBrackets(s):
	return s.strip('{}')
	
def parseParam(s):
	#tag = re.compile(r"^\*(?:\s|\t)*(@[\w]+)(?:\s|\t)+(\{[\w]+\})?(?:\s|\t)+([\w]*)(?:\s|\t)*([\w\s\t]*)")
	return s
	
decl['doc']['param'] = parseParam

def parseReturn(s):
	return s
	
decl['doc']['return'] = parseReturn
	

def parseProperty(s):
	return s
	
decl['doc']['property'] = parseProperty
	
decl['doc']['this'] = stripCurlyBrackets

decl['doc']['description'] = asIs

decl['doc']['author'] = asIs
decl['doc']['copyright'] = asIs
decl['doc']['file'] = asIs
decl['doc']['namespace'] = asIs
decl['doc']['version'] = asIs
decl['doc']['depends'] = asIs #should try to get imports/requires by itself

decl['unit']['prepare'] = asIs
decl['unit']['assert'] = asIs

lang = {}
lang['js'] = {}

def jsExtract(s):
	res = {}
	
	isComment = re.match(r'^(/\*|//)', s) is not None
	if isComment:
		return
		
	isFn = re.match(r'.*function(\s|\t)*.*(\s|\t)*\(', s)
	if isFn is not None:
		res['type'] = 'function'
		proto = re.match(r'^(?P<parent>..*)\.prototype\.(?P<name>..*)(\s|\t)*=', s)
		if proto is not None:
			res['name'] = proto.group('name')
			res['parent'] = proto.group('parent')
			return res
			
		fn = re.match(r'^function(\s|\t)*(?P<name>..*)(\s|\t)*\(', s)
		if fn is not None:
			res['name'] = fn.group('name')
			return res
	else:
		res['type'] = 'data'
		
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

def collectComments(uri, pref='/*', suf='*/'):
	a = []
	temp = []
	flag = False
	one_more = False
	
	f = open(uri, 'r')
	for line in f:

		line = line.strip()
	
		if line.startswith(pref):
			flag = True;
		
		if flag:
			temp.append(line)
		
		if one_more:
			one_more = False
			flag = False
			a.append(temp)
			temp = []
	
		if line.startswith(suf):
			one_more = True;
	return uri,a

def buildTagParsingRegexp(l):
	res = []
	for i in l:
		res.append(r'(^(?P<'+i['name']+'>'+i['pref']+'[\w]+)(\s|\t)*(?P<'+i['name']+'_rest>.*))');
	return r'|'.join(res)

def parseCommentCollection(col, tags, decl):
	eset = {'header':{}, 'content':[]}
	reg_str = buildTagParsingRegexp(tags)
	tag_re = re.compile(reg_str)
	strip_re = re.compile(r"^(/\*|\*)?\**(?P<let_me_see_you_stripped>.*)(\s|\t)*\**(\*|\*/)?$")
	count = 0
	for i in col:
		e = {}
		for tag in tags:
			e[tag['name']] = {}
		
		tag_name = None
		end = False
		tp = None
		header = False
		
		for j in i:
			j = j.strip()
			if not end:
				end = re.match(r'\*/$', j) is not None
				
			st = strip_re.match(j)
			if st is not None:
				j = st.group('let_me_see_you_stripped').strip()
			
			s = tag_re.match(j)
			if s is not None:
				for tag in tags:
					if s.group(tag['name']) is not None:
						tp = tag['name']
						break

				tag_name = s.group(tp)[1:]
			
			if not end:
				if tag_name is None:
					tag_name = 'description'
					tp = 'doc'
				if j is not '':
					if tag_name not in e[tp]:
						e[tp][tag_name] = []
					if tag_name in decl[tp] and s is not None:
						e[tp][tag_name].append(decl[tp][tag_name](s.group(tp+'_rest')))
					
					ln = len(e[tp][tag_name])
					if s is None: 
						if ln > 0:
							e[tp][tag_name][ln-1] += '\n'+j 
						else:
							e[tp][tag_name].append(j)
							
			
			else:
				j = i[len(i)-1].strip()
				
				if not header:
					found = False
					if count == 0 and j == '':
						found = True
					else:
						for tp in e:
							if 'file' in tp:
								found = True
					
					if found:
						header = True
						eset['header'] = e['doc'];
						e = None
				
				if j != '':
					fn_info = lang['js'](j)
					if fn_info is not None and 'name' in fn_info:
						for f in fn_info:
							e[f] = fn_info[f]
					else:
						e = None
				#test here if the last line is valid for extraction or is it a file header comment, flag it
				tag_name = None
				end = False
				break
		#add it if the last line is valid
		if e is not None:
			eset['content'].append(e)
		count += 1
	return eset
	
uri = 'Map.js'
res = collectComments(uri)
result = parseCommentCollection(res[1], tags, decl)
result['header']['uri'] = uri 
print result
