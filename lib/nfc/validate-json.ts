/**
 * JSON テキストを検証する。
 *
 * @param raw - 入力文字列
 * @returns 問題がなければ null、あればユーザー向けメッセージ
 */
export function validateJsonText(raw: string): string | null {
  const value = raw.trim();
  if (!value) {
    return "内容が空です。";
  }

  try {
    JSON.parse(value);
    return null;
  } catch (error) {
    return toJsonErrorMessage(error, value);
  }
}

/**
 * SyntaxError などから分かりやすい日本語メッセージを作る。
 *
 * @param error - 例外
 * @param value - 入力原文
 * @returns 表示用メッセージ
 */
function toJsonErrorMessage(error: unknown, value: string): string {
  if (!(error instanceof SyntaxError)) {
    return "JSON として解釈できません。";
  }

  const message = error.message;

  if (hasUnbalancedQuotes(value)) {
    return '文字列の引用符 (") が閉じられていません。';
  }

  if (/,(\s*[}\]])/.test(value)) {
    return "末尾のカンマ (,) は JSON では使えません。";
  }

  const braceBalance = countChar(value, "{") - countChar(value, "}");
  if (braceBalance > 0) {
    return "オブジェクトの閉じ括弧 } が不足しています。";
  }
  if (braceBalance < 0) {
    return "オブジェクトの開き括弧 { と閉じ括弧 } の数が合いません。";
  }

  const bracketBalance = countChar(value, "[") - countChar(value, "]");
  if (bracketBalance > 0) {
    return "配列の閉じ括弧 ] が不足しています。";
  }
  if (bracketBalance < 0) {
    return "配列の開き括弧 [ と閉じ括弧 ] の数が合いません。";
  }

  if (/unexpected end|end of (json )?data|eof/i.test(message)) {
    return "JSON が途中で終わっています。括弧や引用符を確認してください。";
  }

  if (/unexpected token/i.test(message)) {
    return "JSON の構文が不正です。カンマ・コロン・引用符を確認してください。";
  }

  return "JSON として解釈できません。構文を確認してください。";
}

/**
 * 文字列リテラル外のダブルクォートが奇数個かどうかをざっくり判定する。
 * エスケープは簡易対応（直前が奇数個の \\ でない " を数える）。
 *
 * @param value - 入力
 * @returns 閉じられていない可能性が高いとき true
 */
function hasUnbalancedQuotes(value: string): boolean {
  let count = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== '"') {
      continue;
    }
    let escaped = false;
    let lookbehind = index - 1;
    while (lookbehind >= 0 && value[lookbehind] === "\\") {
      escaped = !escaped;
      lookbehind -= 1;
    }
    if (!escaped) {
      count += 1;
    }
  }
  return count % 2 === 1;
}

/**
 * 文字の出現回数を数える。
 *
 * @param value - 入力
 * @param char - 対象文字
 * @returns 回数
 */
function countChar(value: string, char: string): number {
  let count = 0;
  for (const current of value) {
    if (current === char) {
      count += 1;
    }
  }
  return count;
}
