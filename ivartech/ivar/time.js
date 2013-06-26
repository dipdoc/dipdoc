namespace('ivar.time');

//TODO: EMBED IT INTO FRAMEWORK
function fancyDate(then, now, suffix) {
  if(now === undefined)
		now = new Date();
	
	if(suffix === undefined)
		suffix = 'ago';
	
	var thenMs = null;
	typeof then === 'number' ? thenMs = then : thenMs = then.getTime();
	var nowMs = null;
	typeof now === 'number' ? nowMs = now : nowMs = now.getTime();
	var passed = Math.round((nowMs - thenMs) / 1000);
	if (passed > 59) {
		passed = Math.round(passed / 60);
		if (passed > 59) {
			passed = Math.round(passed / 60);
			if (passed > 23) {
				if ((now.getFullYear() - then.getFullYear() > 0)
					&& (12 + now.getMonth() - then.getMonth() > 11)) {
					return then.getDate() + ' '
						+ _months[then.getMonth()] + ' '
							+ then.getFullYear();
				} else {
					return then.getDate() + ' ' +_months[then.getMonth()];
				}
			} else {
				return passed + 'h '+suffix;
			}
		} else {
			return passed + 'm '+suffix;
		}
	} else {
		return passed + 's '+suffix;
	}
};

function utcTimestamp() {
	var now = new Date;
	return now.getTime() + now.getTimezoneOffset()*60*1000;
}

Date.prototype.getNumberOfDays = function() {
	return new Date(this.getFullYear(), this.getMonth()+1, 0).getDate();
}

Date.prototype.getNextMonth = function() {
	var month = this.getMonth();
	var year = this.getFullYear();
	if(month == 11) {
		month = 0;
		year += 1;
	} else {
		month += 1;
	}
	return new Date(year, month, this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
}

Date.prototype.getPrevMonth = function() {
	var month = this.getMonth();
	var year = this.getFullYear();
	if(month == 0) {
		month = 11;
		year -= 1;
	} else {
		month -= 1;
	}
	return new Date(year, month, this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
}

Date.prototype.getNextDay = function() {
	var numDays = this.getNumberOfDays();
	var day = this.getDate()+1;
	var nextMonth = this;
	if(day > numDays) {
		day = 1;
		nextMonth = this.getNextMonth();
	}
	return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day, this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
}

Date.prototype.getPrevDay = function() {
	var day = this.getDate()-1;
	var prevMonth = this;
	if(day == 0) {
		prevMonth = this.getPrevMonth();
		var numDays = prevMonth.getNumberOfDays();
		day = numDays;
	}
	return new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day, this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
}
