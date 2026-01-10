import Database from 'better-sqlite3';
const db = new Database('./data/emails.db');

// 공백이 포함된 classification 값 수정
const stmt = db.prepare(`
  UPDATE emails 
  SET classification = TRIM(classification) 
  WHERE id IN (18, 33, 100)
`);

const result = stmt.run();
console.log(`✅ ${result.changes}개 메일의 classification 값을 정리했습니다.`);

// 검증
const check = db.prepare('SELECT id, classification FROM emails WHERE id IN (18, 33, 100)').all();
console.log('\n수정된 값 확인:');
check.forEach(row => {
  console.log(`  ID ${row.id}: "${row.classification}"`);
});

db.close();
