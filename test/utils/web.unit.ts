import { getField } from "../../src/utils/web";
import { Request } from 'express';

describe('getField', () => {
it('should return the value of the specified field if it exists and is not empty', () => {
    const req: Request = { body: { name: 'John Doe' } } as Request;
    const fieldName = 'name';
    const result = getField(req, fieldName);
    expect(result).toEqual('John Doe');
});

it('should return an empty string if the specified field does not exist', () => {
    const req: Request = { body: {} } as Request;
    const fieldName = 'name';
    const result = getField(req, fieldName);
    expect(result).toEqual('');
});

it('should return an empty string if the specified field is empty', () => {
    const req: Request = { body: { name: '' } } as Request;
    const fieldName = 'name';
    const result = getField(req, fieldName);
    expect(result).toEqual('');
});

it('should not return null if the specified field is empty', () => {
    const req: Request = { body: { name: '' } } as Request;
    const fieldName = 'name';
    const result = getField(req, fieldName);
    expect(result).not.toBeNull();
});
});