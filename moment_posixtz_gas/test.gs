
function testParsePosixTZ() {
  //"<-03>3<-02>,M3.5.0/02,M10.5.0/03";
  // '<+1030>-10:30<+11>-11,M10.1.0,M4.1.0';
  const tz ='<+1030>-10:30<+11>-11,M10.1.0,M4.1.0';
  const parsed = posixtz.parsePosixTZ(tz);
var tzz=getOffsetForLocalDateWithPosixTZ('2025-04-06T01:00:00+10:30', tz)/60;
var tzd=getOffsetForLocalDateWithPosixTZ('2025-04-06T01:30:00+10:30', tz)/60;
var tza=getOffsetForLocalDateWithPosixTZ('2025-10-05T02:00:00+11:00', tz)/60;
var tzda=getOffsetForLocalDateWithPosixTZ('2025-10-05T02:30:00+11:00', tz)/60;

var d= getOffset_PosixTZ('2025-10-05T02:30:00+11:00', tz,"d");
var h= getOffset_PosixTZ('2025-10-05T02:30:00+11:00', tz,"h");
var m= getOffset_PosixTZ('2025-10-05T02:30:00+11:00', tz,"m");
var s= getOffset_PosixTZ('2025-10-05T02:30:00+11:00', tz,"s");
var millisecond= getOffset_PosixTZ('2025-10-05T02:30:00+11:00', tz,"millisecond");

var tzdad=dateFormat_PosixTZ('2025-10-05T02:30:00+11:00', tz,"MM-DD(ddd)HH:mm:ss ZZ");
var tzdab=dateFormat_PosixTZ('2025-10-05T02:30:00+11:00', tz,"MM-DD(ddd)HH:mm:ss Z");
var tzddd=formatLocalDateWithOffset('2025-10-05T02:30:00+11:00', tz);
  return tz; // セルに表示する値を返す
}

function posixtzzz_autralia(){//2025年4月6日（日）3時0分 AEDT

var tz=getOffsetForLocalDateWithPosixTZ('2024-10-06T01:00:00+10:00', 'AEST-10AEDT,M10.1.0,M4.1.0/3')/60;
var tzd=getOffsetForLocalDateWithPosixTZ('2024-10-06T02:00:00+10:00', 'AEST-10AEDT,M10.1.0,M4.1.0/3')/60;
var tza=getOffsetForLocalDateWithPosixTZ('2025-04-06T02:00:00+11:00', 'AEST-10AEDT,M10.1.0,M4.1.0/3')/60;
var tzda=getOffsetForLocalDateWithPosixTZ('2025-04-06T03:00:00+11:00', 'AEST-10AEDT,M10.1.0,M4.1.0/3')/60;

  return tz; // セルに表示する値を返す
}

function posixtzzz_america(){
var tz=getOffsetForLocalDateWithPosixTZ('2025-11-02T01:30:00-07:00', 'PST8PDT,M3.2.0,M11.1.0')/60;
var tzd=getOffsetForLocalDateWithPosixTZ('2025-11-02T02:30:00-07:00', 'PST8PDT,M3.2.0,M11.1.0')/60;
var tza=getOffsetForLocalDateWithPosixTZ('2025-03-09T03:00:00-07:00', 'PST8PDT,M3.2.0,M11.1.0')/60;
var tzda=getOffsetForLocalDateWithPosixTZ('2025-03-09T02:00:00-07:00', 'PST8PDT,M3.2.0,M11.1.0')/60;

  return tz; // セルに表示する値を返す
}



function getLocalTZ(tz) {
  const parts = tz.split(',');
  const localTZ = parts[0];

  // localTZ の部分だけをマッチさせる正規表現
  const regex = /^(?:<[+-]\d{2,4}>-\d{1,2}(?::[0-5]\d)?(?:<[+-]\d{2,4}>-\d{1,2}(?::[0-5]\d)?)?|<[+-]\d{2,4}>-\d{1,2}(?::[0-5]\d)?|[A-Za-z]{3,}[-+]?\d+(?::[0-5]\d)?(?:[A-Za-z]{3,})?|<-?\d+>\d(?:<-?\d+>)?|[A-Za-z]{3,}[-+]?\d+)$/;

  if (regex.test(localTZ)) {
    return localTZ;
  } else {
    return null; // またはエラー処理
  }
}

const testStrings = [
    "PST8PDT,M3.2.0,M11.1.0",
    "MST7MDT,M3.2.0,M11.1.0",
    "CST6CDT,M3.2.0,M11.1.0",
    "EST5EDT,M3.2.0,M11.1.0",
    "AEST-10AEDT,M10.1.0,M4.1.0/3",
    "<+1030>-10:30<+11>-11,M10.1.0,M4.1.0",
    "<+0545>-5:45",
    "CET-1CEST,M3.5.0/02,M10.5.0/03",
    "<-03>3",
    "<-03>3<-02>,M3.5.0/02,M10.5.0/03",
    "JST-9",
    "GMT5"
];

testStrings.forEach(tz => {
    const extracted = getLocalTZ(tz);
    if (extracted) {
      console.log(`Original: ${tz}, Extracted: ${extracted}`);
    } else
    {
      console.log(`Original: ${tz}, Extracted: Error`);
    }
});