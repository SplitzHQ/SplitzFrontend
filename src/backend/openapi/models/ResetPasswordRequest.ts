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
 * @interface ResetPasswordRequest
 */
export interface ResetPasswordRequest {
    /**
     * 
     * @type {string}
     * @memberof ResetPasswordRequest
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof ResetPasswordRequest
     */
    resetCode: string;
    /**
     * 
     * @type {string}
     * @memberof ResetPasswordRequest
     */
    newPassword: string;
}

/**
 * Check if a given object implements the ResetPasswordRequest interface.
 */
export function instanceOfResetPasswordRequest(value: object): value is ResetPasswordRequest {
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('resetCode' in value) || value['resetCode'] === undefined) return false;
    if (!('newPassword' in value) || value['newPassword'] === undefined) return false;
    return true;
}

export function ResetPasswordRequestFromJSON(json: any): ResetPasswordRequest {
    return ResetPasswordRequestFromJSONTyped(json, false);
}

export function ResetPasswordRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResetPasswordRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'email': json['email'],
        'resetCode': json['resetCode'],
        'newPassword': json['newPassword'],
    };
}

export function ResetPasswordRequestToJSON(json: any): ResetPasswordRequest {
    return ResetPasswordRequestToJSONTyped(json, false);
}

export function ResetPasswordRequestToJSONTyped(value?: ResetPasswordRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'email': value['email'],
        'resetCode': value['resetCode'],
        'newPassword': value['newPassword'],
    };
}

