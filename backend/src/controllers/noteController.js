const { pool } = require('../db/pool');

function toBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

function mapNote(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    isImportant: Boolean(row.is_important),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function sendDatabaseError(res, error) {
  console.error('[api] database error:', error.message);
  return res.status(503).json({
    success: false,
    message: 'Database connection or query failed.',
    error: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
}

// 목록 조회, 검색, 카테고리 필터, 중요 표시 필터를 한 API에서 처리한다.
async function getNotes(req, res) {
  const { search, category, important } = req.query;
  const conditions = [];
  const params = {};

  if (search && search.trim()) {
    conditions.push('(title LIKE :search OR content LIKE :search)');
    params.search = `%${search.trim()}%`;
  }

  if (category && category.trim()) {
    conditions.push('category = :category');
    params.category = category.trim();
  }

  if (important !== undefined && important !== '') {
    conditions.push('is_important = :important');
    params.important = toBoolean(important) ? 1 : 0;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT id, title, content, category, is_important, created_at, updated_at
    FROM notes
    ${whereClause}
    ORDER BY is_important DESC, created_at DESC
  `;

  try {
    const [rows] = await pool.execute(sql, params);
    return res.json({
      success: true,
      count: rows.length,
      data: rows.map(mapNote)
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

// 검색 기능을 명확히 확인하기 위한 전용 검색 API다.
async function searchNotes(req, res) {
  const keyword = (req.query.q || req.query.keyword || req.query.search || '').trim();

  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: 'Search keyword is required. Use q, keyword, or search query parameter.'
    });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, title, content, category, is_important, created_at, updated_at
       FROM notes
       WHERE title LIKE :search OR content LIKE :search
       ORDER BY is_important DESC, created_at DESC`,
      { search: `%${keyword}%` }
    );

    return res.json({
      success: true,
      keyword,
      count: rows.length,
      data: rows.map(mapNote)
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

async function getNoteById(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, title, content, category, is_important, created_at, updated_at
       FROM notes
       WHERE id = :id`,
      { id: req.params.id }
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    return res.json({ success: true, data: mapNote(rows[0]) });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

// 노트 생성 API
async function createNote(req, res) {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();
  const category = (req.body.category || 'General').trim();
  const isImportant = toBoolean(req.body.isImportant);

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'title and content are required.'
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO notes (title, content, category, is_important)
       VALUES (:title, :content, :category, :isImportant)`,
      { title, content, category: category || 'General', isImportant: isImportant ? 1 : 0 }
    );

    const [rows] = await pool.execute(
      `SELECT id, title, content, category, is_important, created_at, updated_at
       FROM notes
       WHERE id = :id`,
      { id: result.insertId }
    );

    return res.status(201).json({
      success: true,
      message: 'Note created.',
      data: mapNote(rows[0])
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

// 노트 수정 API
async function updateNote(req, res) {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();
  const category = (req.body.category || 'General').trim();
  const isImportant = toBoolean(req.body.isImportant);

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'title and content are required.'
    });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE notes
       SET title = :title,
           content = :content,
           category = :category,
           is_important = :isImportant
       WHERE id = :id`,
      {
        id: req.params.id,
        title,
        content,
        category: category || 'General',
        isImportant: isImportant ? 1 : 0
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const [rows] = await pool.execute(
      `SELECT id, title, content, category, is_important, created_at, updated_at
       FROM notes
       WHERE id = :id`,
      { id: req.params.id }
    );

    return res.json({
      success: true,
      message: 'Note updated.',
      data: mapNote(rows[0])
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

// 노트 삭제 API
async function deleteNote(req, res) {
  try {
    const [result] = await pool.execute('DELETE FROM notes WHERE id = :id', { id: req.params.id });

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    return res.json({
      success: true,
      message: 'Note deleted.',
      deletedId: Number(req.params.id)
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

// 중요 표시 변경 API
async function updateImportant(req, res) {
  if (req.body.isImportant === undefined) {
    return res.status(400).json({ success: false, message: 'isImportant is required.' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE notes SET is_important = :isImportant WHERE id = :id',
      { id: req.params.id, isImportant: toBoolean(req.body.isImportant) ? 1 : 0 }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const [rows] = await pool.execute(
      `SELECT id, title, content, category, is_important, created_at, updated_at
       FROM notes
       WHERE id = :id`,
      { id: req.params.id }
    );

    return res.json({
      success: true,
      message: 'Important flag updated.',
      data: mapNote(rows[0])
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

module.exports = {
  getNotes,
  searchNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  updateImportant
};
