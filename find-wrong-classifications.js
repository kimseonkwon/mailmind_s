import Database from 'better-sqlite3';

const db = new Database('./data/emails.db');

console.log('=== 전체 분류 현황 ===');
const summary = db.prepare(`
  SELECT classification, COUNT(*) as count 
  FROM emails 
  GROUP BY classification 
  ORDER BY classification
`).all();

summary.forEach(row => {
  console.log(`"${row.classification}": ${row.count}개`);
});

// 공백이 있는 메일 찾기
console.log('\n=== 공백이 있는 classification ===');
const withSpace = db.prepare(`
  SELECT id, subject, classification, LENGTH(classification) as len
  FROM emails 
  WHERE classification != TRIM(classification)
`).all();

withSpace.forEach(email => {
  console.log(`ID ${email.id}: "${email.classification}" (길이: ${email.len}) - ${email.subject}`);
});

// "첨부파일"로 분류된 메일 중 첨부 없는 것들
console.log('\n=== "첨부파일"로 분류되었지만 [첨부]가 없는 메일 ===');
const wrongAttachment = db.prepare(`
  SELECT id, subject, SUBSTR(body, 1, 80) as body_preview
  FROM emails 
  WHERE (classification = '첨부파일' OR classification = ' 첨부파일')
    AND subject NOT LIKE '%[첨부]%'
  ORDER BY id
`).all();

wrongAttachment.forEach(email => {
  console.log(`\nID ${email.id}: ${email.subject}`);
  console.log(`  내용: ${email.body_preview}...`);
});

// "공지"가 아닌데 교육, 안내 등이 있는 메일
console.log('\n=== "공지"가 아닌데 교육/안내 제목인 메일 ===');
const wrongNotice = db.prepare(`
  SELECT id, subject, classification
  FROM emails 
  WHERE classification != '공지' 
    AND classification != ' 공지'
    AND (subject LIKE '%교육%' OR subject LIKE '%안내%')
  ORDER BY id
`).all();

wrongNotice.forEach(email => {
  console.log(`ID ${email.id}: ${email.classification} - ${email.subject}`);
});

db.close();
