// moment は moment.js と moment-timezone.js によりグローバルに定義済みと仮定
// require('moment-timezone') を削除
//ぐぐったらみつかった　posixtz対応のmoment-timezone.jsかくちょうらいぶららりー
//https://github.com/jdiamond/posixtz/blob/master/index.js
//2025/03/21　dateformat_posixもたぶんうまく動いていないようなので変更, z はzoneparserがいるので未対応
//2025/03/20　posix 対応javascriptを見つけたがばぐってるので修正（）、たぶんもとはUTCサーバーたいむじゃないと動かないハズ（）
//ぐろっくたんの評価　https://grok.com/share/bGVnYWN5_7dee4cb7-10a9-4f1c-bea4-540a91679d5c

// グローバルオブジェクトとして関数を定義（exportsを削除）
const posixtz = {
  formatPosixTZ: formatPosixTZ,
  parsePosixTZ: parsePosixTZ,
  getOffsetForLocalDateWithPosixTZ: getOffsetForLocalDateWithPosixTZ,
  formatLocalDateWithOffset: formatLocalDateWithOffset
};

function formatPosixTZ(tz, year) {
  var jan = moment.tz({ year, month: 0, day: 1 }, tz);
  var jun = moment.tz({ year, month: 5, day: 1 }, tz);
  var janOffset = jan.utcOffset();
  var junOffset = jun.utcOffset();
  var stdOffset = Math.min(janOffset, junOffset);
  var dltOffset = Math.max(janOffset, junOffset);
  var std = stdOffset === janOffset ? jan : jun;
  var dlt = dltOffset === janOffset ? jan : jun;

  var s = formatAbbreviationForPosix(std).concat(formatOffsetForPosix(stdOffset));

  if (stdOffset !== dltOffset) {
    s = s.concat(formatAbbreviationForPosix(dlt));

    if (dltOffset !== stdOffset + 60) {
      s = s.concat(formatOffsetForPosix(dltOffset));
    }

    s = s.concat(',').concat(formatTransitionForPosix(tz, std));
    s = s.concat(',').concat(formatTransitionForPosix(tz, dlt));
  }

  return s;

  function formatAbbreviationForPosix(m) {
    var a = m.format('z');
    return /^[\+\-\d]+$/.test(a) ? '<'.concat(a).concat('>') : a;
  }

  function formatOffsetForPosix(offset) {
    var h = (-offset / 60) | 0;
    var m = Math.abs(offset % 60);
    return h + (m === 0 ? '' : ':'.concat(m < 10 ? '0' : '').concat(m));
  }

  function formatTransitionForPosix(tz, m) {
    var transition = getTransition(tz, m);

    if (!transition) {
      return 'J365/25';
    }

    var n = getWeekNumber(transition);

    if (n === 4) {
      for (var i = 1; i <= 6; i++) {
        var nextTransition = getTransition(tz, m.clone().add(i, 'years'));

        if (!nextTransition) {
          continue;
        }

        n = Math.max(n, getWeekNumber(nextTransition));
      }
    }

    var s = transition.format('[M]M.[n].d').replace('n', n);
    var time = transition
      .format('[/]H:mm:ss')
      .replace(/\:00$/, '')
      .replace(/\:00$/, '');

    if (time !== '/2') {
      s = s.concat(time);
    }

    return s;
  }

  function getTransition(tz, m) {
    var zone = moment.tz.zone(tz);
    var ts = zone.untils[zone._index(m)];

    if (!isFinite(ts)) {
      return null;
    }

    return moment(ts).utcOffset(-zone.utcOffset(ts - 1));
  }

  function getWeekNumber(m) {
    return Math.ceil(m.date() / 7);
  }
}

function parsePosixTZ(tz) {
  const result = {
    stdAbbr: null,
    stdOffset: 0,
    dst: false,
    dstAbbr: null,
    dstOffset: null,
    dstStart: null,
    dstEnd: null
  };

  const parts = tz.split(',');
  const localTZ = parts[0];

// localTZ の部分だけをマッチさせる正規表現
  const regex = /^(?:<[+-]\d{2,4}>-\d{1,2}(?::[0-5]\d)?(?:<[+-]\d{2,4}>-\d{1,2}(?::[0-5]\d)?)?|<[+-]\d{2,4}>-\d{1,2}(?::[0-5]\d)?|[A-Za-z]{3,}[-+]?\d+(?::[0-5]\d)?(?:[A-Za-z]{3,})?|<-?\d+>\d(?:<-?\d+>)?|[A-Za-z]{3,}[-+]?\d+)$/;
  
  const match_tz = regex.exec(localTZ);
  if (!match_tz) {
    return null;
  }


  const LOCAL_TZ_RE = /^(\w+)([+-]?\d+)(\w+([+-]?\d+)?)?/;
  const LOCAL_TZ_AB  = /^(<.*?>)([+-]?\d+(?::\d+)?)(?:(<.*?>)([+-]?\d+(?::\d+)?)?)?/;  //angle brackets
  // Groups:           1    2         3   4
  // 1: stdAbbr
  // 2: stdOffset
  // 3: dstAbbr
  // 4: dstOffset

  var match = LOCAL_TZ_RE.exec(localTZ);
  if (!match) {
    match = LOCAL_TZ_AB.exec(localTZ);
  }

  result.stdAbbr = match[1];
  result.stdOffset = match[2] ? parseOffset(match[2]) : 0;

  if (match[3]) {
    result.dst = true;
    result.dstAbbr = match[3];
    result.dstOffset = match[4] ? parseOffset(match[4]) : result.stdOffset + 60;
    result.dstStart = parseTransition(parts[1]);
    result.dstEnd = parseTransition(parts[2]);
  }

  return result;

  function parseOffset(offset) {
    // hh:mm形式に対応
    const [hours, minutes] = offset.split(':');
    let totalMinutes = Number(hours) * 60;
    if (minutes !== undefined) {
      totalMinutes += Number(minutes) * (hours[0] === '-' ? -1 : 1);
    }
    return totalMinutes * -1; // POSIXでは正のオフセットが西側、負が東側
  }

  function parseTransition(transition) {
    if (transition[0] === 'M') {
      const parts = transition.slice(1).split('/');

      const [month, week, day] = parts[0].split('.');

      const time = {
        hour: 2,
        minute: 0,
        second: 0
      };

      if (parts[1]) {
        const timeParts = parts[1].split(':');

        time.hour = Number(timeParts[0]);
        time.minute = timeParts[1] ? Number(timeParts[1]) : 0;
        time.second = timeParts[2] ? Number(timeParts[2]) : 0;
      }

      return Object.assign(
        {
          month: Number(month),
          week: Number(week),
          day: Number(day)
        },
        time
      );
    }

    return null; // TODO: J形式のサポートが必要なら追加
  }
}

function getOffsetForLocalDateWithPosixTZ(localDate, posixTZ) {
  const dt = moment.utc(localDate);
  const parsedTZ = parsePosixTZ(posixTZ);
   

  if (parsedTZ.dst) {
    const year = dt.year();
    const dstStart = transitionToDate(year, parsedTZ.dstStart,parsedTZ.stdOffset);
    const dstEnd = transitionToDate(year, parsedTZ.dstEnd,parsedTZ.dstOffset);
   

  　if(dstStart > dstEnd){
    if (dt >= dstStart || dt < dstEnd) {
      return parsedTZ.dstOffset;
    }
    }
    else{
    if (dt >= dstStart && dt < dstEnd) {
      return parsedTZ.dstOffset;
    }
    }
  }

  return parsedTZ.stdOffset;

  function transitionToDate(year, { month, week, day, hour, minute, second },offset) {
    const jsMonth = month - 1;

    const dt = moment.utc({ year, month: jsMonth });

    dt.weekday(day);

    if (dt.month() !== jsMonth) {
      dt.add(1, 'week');
    }

    if (week > 1) {
      dt.add(week - 1, 'weeks');

      if (dt.month() !== jsMonth) {
        dt.subtract(1, 'week');
      }
    }


    dt.set({ hour, minute, second });
    dt.subtract(offset,'m');

    return dt.toDate();
  }
}

function formatLocalDateWithOffset(localDate, posixTZ) {
  const dt = moment(localDate);//utc not needed
  const offset = getOffsetForLocalDateWithPosixTZ(dt, posixTZ);

  return  dt.utcOffset(offset).format('YYYY-MM-DDTHH:mm:ssZ');
}

//add custom function
function getOffset_PosixTZ(localDate, posixTZ,mode) {
var unit= moment.normalizeUnits(mode);
var offset=  getOffsetForLocalDateWithPosixTZ(localDate, posixTZ);
switch (unit) {//h hours alies,momentjis
            case 'millisecond':
                return offset*60*1000;
            case 'second':
                return offset*60;
            case 'minute':
                return offset;
            case 'hour':
                return offset/60;
            case 'day':
                return offset/60/24;
            default:
                return offset; 
                }
return;
}

function dateFormat_PosixTZ(localDate, posixTZ,tz_format) {
  const dt = moment(localDate);
  const offset = getOffsetForLocalDateWithPosixTZ(dt, posixTZ);
  dt.utcOffset(offset);

  //const parsedTZ = parsePosixTZ(posixTZ);
  //var isDST=dt.isDST();   z not　support
  //to z support need parse packed_zone string ,generate by posix_string
  //https://momentjs.com/timezone/docs/#/data-loading/adding-a-zone/
  //https://momentjs.com/timezone/docs/#/data-formats/packed-format/

  tz_format=tz_format.replace(/z/gm,"");

  return dt.format(tz_format);
}
