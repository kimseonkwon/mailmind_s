import Database from 'better-sqlite3';

const db = new Database('./data/emails.db');

// 1. 공백 제거 (ID 54, 82)
console.log('1️⃣ 공백 제거...');
db.prepare(`UPDATE emails SET classification = TRIM(classification) WHERE id IN (54, 82)`).run();

// 2. 첨부파일 → 업무요청 (ID 1, 7, 12, 14)
console.log('2️⃣ 첨부파일 → 업무요청 변경...');
db.prepare(`UPDATE emails SET classification = '업무요청' WHERE id IN (1, 7, 12, 14)`).run();

// 3. 첨부파일 → 회의 (ID 30: 용접 기술 교육)
console.log('3️⃣ 첨부파일 → 회의 변경...');
db.prepare(`UPDATE emails SET classification = '회의' WHERE id = 30`).run();

// 4. 회의 → 공지 (ID 22, 38: 교육 안내)
console.log('4️⃣ 회의 → 공지 변경...');
db.prepare(`UPDATE emails SET classification = '공지' WHERE id IN (22, 38)`).run();

// 결과 확인
console.log('\n✅ 수정 완료! 최종 분류 현황:');
const summary = db.prepare(`
  SELECT classification, COUNT(*) as count 
  FROM emails 
  GROUP BY classification 
  ORDER BY classification
`).all();

summary.forEach(row => {
  console.log(`  ${row.classification}: ${row.count}개`);
});

// 총 개수 확인
const total = db.prepare(`SELECT COUNT(*) as total FROM emails`).get();
console.log(`\n총 메일: ${total.total}개`);

db.close();
