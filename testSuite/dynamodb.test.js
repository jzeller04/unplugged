// Mock DynamoDB service BEFORE importing
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
  PutItemCommand: jest.fn(),
  GetItemCommand: jest.fn(),
  QueryCommand: jest.fn(),
  UpdateItemCommand: jest.fn(),
  DeleteItemCommand: jest.fn(),
}));

jest.mock('@aws-sdk/util-dynamodb', () => ({
  marshall: jest.fn((item) => item),
  unmarshall: jest.fn((item) => item),
}));

import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

describe('DynamoDB Operations', () => {
  let mockClient;
  let mockSend;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    mockSend = jest.fn();
    mockClient = {
      send: mockSend,
    };
    
    // Setup the mock implementation
    DynamoDBClient.mockImplementation(() => mockClient);
  });

  describe('PutItem Operations', () => {
    test('successfully puts item into DynamoDB', async () => {
      const testItem = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      marshall.mockReturnValue(testItem);
      mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

      const command = new PutItemCommand({
        TableName: 'Users',
        Item: marshall(testItem),
      });

      const result = await mockClient.send(command);

      expect(mockSend).toHaveBeenCalledWith(command);
      expect(result.$metadata.httpStatusCode).toBe(200);
      expect(marshall).toHaveBeenCalledWith(testItem);
    });

    test('handles put item failure', async () => {
      const error = new Error('DynamoDB error');
      mockSend.mockRejectedValue(error);

      const command = new PutItemCommand({
        TableName: 'Users',
        Item: marshall({ id: '123' }),
      });

      await expect(mockClient.send(command)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('GetItem Operations', () => {
    test('successfully retrieves item from DynamoDB', async () => {
      const mockItem = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      unmarshall.mockReturnValue(mockItem);
      mockSend.mockResolvedValue({
        Item: mockItem,
        $metadata: { httpStatusCode: 200 },
      });

      const command = new GetItemCommand({
        TableName: 'Users',
        Key: marshall({ id: '123' }),
      });

      const result = await mockClient.send(command);

      expect(mockSend).toHaveBeenCalledWith(command);
      expect(result.Item).toEqual(mockItem);
    });

    test('returns undefined for non-existent item', async () => {
      mockSend.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      const command = new GetItemCommand({
        TableName: 'Users',
        Key: marshall({ id: 'nonexistent' }),
      });

      const result = await mockClient.send(command);

      expect(result.Item).toBeUndefined();
    });
  });

  describe('Query Operations', () => {
    test('successfully queries items', async () => {
      const mockItems = [
        { id: '1', username: 'user1', email: 'user1@example.com' },
        { id: '2', username: 'user2', email: 'user2@example.com' },
      ];

      mockSend.mockResolvedValue({
        Items: mockItems,
        Count: 2,
        $metadata: { httpStatusCode: 200 },
      });

      const command = new QueryCommand({
        TableName: 'Users',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: marshall({ ':username': 'user1' }),
      });

      const result = await mockClient.send(command);

      expect(mockSend).toHaveBeenCalledWith(command);
      expect(result.Items).toHaveLength(2);
      expect(result.Count).toBe(2);
    });

    test('returns empty array when no items match query', async () => {
      mockSend.mockResolvedValue({
        Items: [],
        Count: 0,
        $metadata: { httpStatusCode: 200 },
      });

      const command = new QueryCommand({
        TableName: 'Users',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: marshall({ ':username': 'nonexistent' }),
      });

      const result = await mockClient.send(command);

      expect(result.Items).toHaveLength(0);
      expect(result.Count).toBe(0);
    });
  });

  describe('UpdateItem Operations', () => {
    test('successfully updates item', async () => {
      const updatedItem = {
        id: '123',
        username: 'updateduser',
        email: 'updated@example.com',
      };

      unmarshall.mockReturnValue(updatedItem);
      mockSend.mockResolvedValue({
        Attributes: updatedItem,
        $metadata: { httpStatusCode: 200 },
      });

      const command = new UpdateItemCommand({
        TableName: 'Users',
        Key: marshall({ id: '123' }),
        UpdateExpression: 'SET username = :username',
        ExpressionAttributeValues: marshall({ ':username': 'updateduser' }),
        ReturnValues: 'ALL_NEW',
      });

      const result = await mockClient.send(command);

      expect(mockSend).toHaveBeenCalledWith(command);
      expect(result.Attributes).toEqual(updatedItem);
    });
  });

  describe('DeleteItem Operations', () => {
    test('successfully deletes item', async () => {
      mockSend.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      const command = new DeleteItemCommand({
        TableName: 'Users',
        Key: marshall({ id: '123' }),
      });

      const result = await mockClient.send(command);

      expect(mockSend).toHaveBeenCalledWith(command);
      expect(result.$metadata.httpStatusCode).toBe(200);
    });

    test('handles delete with return values', async () => {
      const deletedItem = {
        id: '123',
        username: 'deleteduser',
      };

      unmarshall.mockReturnValue(deletedItem);
      mockSend.mockResolvedValue({
        Attributes: deletedItem,
        $metadata: { httpStatusCode: 200 },
      });

      const command = new DeleteItemCommand({
        TableName: 'Users',
        Key: marshall({ id: '123' }),
        ReturnValues: 'ALL_OLD',
      });

      const result = await mockClient.send(command);

      expect(result.Attributes).toEqual(deletedItem);
    });
  });

  describe('Error Handling', () => {
    test('handles network errors', async () => {
      mockSend.mockRejectedValue(new Error('Network error'));

      const command = new GetItemCommand({
        TableName: 'Users',
        Key: marshall({ id: '123' }),
      });

      await expect(mockClient.send(command)).rejects.toThrow('Network error');
    });

    test('handles validation errors', async () => {
      mockSend.mockRejectedValue(new Error('ValidationException'));

      const command = new PutItemCommand({
        TableName: 'Users',
        Item: marshall({}),
      });

      await expect(mockClient.send(command)).rejects.toThrow('ValidationException');
    });
  });
});