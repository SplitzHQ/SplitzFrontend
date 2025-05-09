/* tslint:disable */
/* eslint-disable */
/**
 * SplitzBackend
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface TransactionBalanceInputDto
 */
export interface TransactionBalanceInputDto {
    /**
     * 
     * @type {string}
     * @memberof TransactionBalanceInputDto
     */
    transactionId?: string;
    /**
     * 
     * @type {string}
     * @memberof TransactionBalanceInputDto
     */
    userId: string;
    /**
     * 
     * @type {number}
     * @memberof TransactionBalanceInputDto
     */
    balance?: number;
}

/**
 * Check if a given object implements the TransactionBalanceInputDto interface.
 */
export function instanceOfTransactionBalanceInputDto(value: object): value is TransactionBalanceInputDto {
    if (!('userId' in value) || value['userId'] === undefined) return false;
    return true;
}

export function TransactionBalanceInputDtoFromJSON(json: any): TransactionBalanceInputDto {
    return TransactionBalanceInputDtoFromJSONTyped(json, false);
}

export function TransactionBalanceInputDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): TransactionBalanceInputDto {
    if (json == null) {
        return json;
    }
    return {
        
        'transactionId': json['transactionId'] == null ? undefined : json['transactionId'],
        'userId': json['userId'],
        'balance': json['balance'] == null ? undefined : json['balance'],
    };
}

export function TransactionBalanceInputDtoToJSON(json: any): TransactionBalanceInputDto {
    return TransactionBalanceInputDtoToJSONTyped(json, false);
}

export function TransactionBalanceInputDtoToJSONTyped(value?: TransactionBalanceInputDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'transactionId': value['transactionId'],
        'userId': value['userId'],
        'balance': value['balance'],
    };
}

