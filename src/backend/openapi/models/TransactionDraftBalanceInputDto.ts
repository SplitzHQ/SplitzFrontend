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
 * @interface TransactionDraftBalanceInputDto
 */
export interface TransactionDraftBalanceInputDto {
    /**
     * 
     * @type {string}
     * @memberof TransactionDraftBalanceInputDto
     */
    transactionDraftId?: string;
    /**
     * 
     * @type {string}
     * @memberof TransactionDraftBalanceInputDto
     */
    userId: string;
    /**
     * 
     * @type {number}
     * @memberof TransactionDraftBalanceInputDto
     */
    balance?: number;
}

/**
 * Check if a given object implements the TransactionDraftBalanceInputDto interface.
 */
export function instanceOfTransactionDraftBalanceInputDto(value: object): value is TransactionDraftBalanceInputDto {
    if (!('userId' in value) || value['userId'] === undefined) return false;
    return true;
}

export function TransactionDraftBalanceInputDtoFromJSON(json: any): TransactionDraftBalanceInputDto {
    return TransactionDraftBalanceInputDtoFromJSONTyped(json, false);
}

export function TransactionDraftBalanceInputDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): TransactionDraftBalanceInputDto {
    if (json == null) {
        return json;
    }
    return {
        
        'transactionDraftId': json['transactionDraftId'] == null ? undefined : json['transactionDraftId'],
        'userId': json['userId'],
        'balance': json['balance'] == null ? undefined : json['balance'],
    };
}

export function TransactionDraftBalanceInputDtoToJSON(json: any): TransactionDraftBalanceInputDto {
    return TransactionDraftBalanceInputDtoToJSONTyped(json, false);
}

export function TransactionDraftBalanceInputDtoToJSONTyped(value?: TransactionDraftBalanceInputDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'transactionDraftId': value['transactionDraftId'],
        'userId': value['userId'],
        'balance': value['balance'],
    };
}

