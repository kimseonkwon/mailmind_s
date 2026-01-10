import Database from 'better-sqlite3';

const db = new Database('./data/emails.db');

// 전체 분류 현황
console.log('=== 전체 분류 현황 ===');
const summary = db.prepare(`
  SELECT classification, COUNT(*) as count 
  FROM emails 
  GROUP BY classification 
  ORDER BY classification
`).all();

summary.forEach(row => {
  console.log(`${row.classification}: ${row.count}개`);
});

// 잘못 분류된 것으로 의심되는 메일들 확인
console.log('\n=== "첨부파일"로 분류된 메일 중 의심스러운 것들 ===');
const attachmentEmails = db.prepare(`
  SELECT id, subject, LEFT(body, 80) as body_preview
  FROM emails 
  WHERE classification = '첨부파일'
  ORDER BY id
`).all();

attachmentEmails.forEach(email => {
  console.log(`\nID ${email.id}: ${email.subject}`);
  console.log(`  내용: ${email.body_preview}...`);
});

db.close();
