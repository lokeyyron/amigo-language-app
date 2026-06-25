import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const tableName = process.env.TABLE_NAME

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  }
}

function getUserId(event) {
  return event.requestContext?.authorizer?.jwt?.claims?.sub
}

export async function handler(event) {
  const userId = getUserId(event)

  if (!userId) {
    return response(401, { message: 'Unauthorized' })
  }

  const method = event.requestContext?.http?.method

  if (method === 'GET') {
    const key = event.queryStringParameters?.key
    const result = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: { userId },
      }),
    )

    const data = result.Item?.data ?? {}

    if (key) {
      return response(200, { key, value: data[key] ?? null })
    }

    return response(200, { data })
  }

  if (method === 'PUT') {
    let body

    try {
      body = JSON.parse(event.body ?? '{}')
    } catch {
      return response(400, { message: 'Invalid JSON body' })
    }

    const key = body.key
    const value = body.value

    if (!key || typeof key !== 'string') {
      return response(400, { message: 'Body must include a string "key"' })
    }

    await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userId },
        UpdateExpression: 'SET #data.#key = :value, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#data': 'data',
          '#key': key,
        },
        ExpressionAttributeValues: {
          ':value': value,
          ':updatedAt': new Date().toISOString(),
        },
      }),
    )

    return response(200, { ok: true, key })
  }

  return response(405, { message: 'Method not allowed' })
}
