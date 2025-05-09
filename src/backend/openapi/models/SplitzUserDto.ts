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
import type { FriendDto } from './FriendDto';
import {
    FriendDtoFromJSON,
    FriendDtoFromJSONTyped,
    FriendDtoToJSON,
    FriendDtoToJSONTyped,
} from './FriendDto';
import type { Group } from './Group';
import {
    GroupFromJSON,
    GroupFromJSONTyped,
    GroupToJSON,
    GroupToJSONTyped,
} from './Group';
import type { GroupBalance } from './GroupBalance';
import {
    GroupBalanceFromJSON,
    GroupBalanceFromJSONTyped,
    GroupBalanceToJSON,
    GroupBalanceToJSONTyped,
} from './GroupBalance';

/**
 * 
 * @export
 * @interface SplitzUserDto
 */
export interface SplitzUserDto {
    /**
     * 
     * @type {string}
     * @memberof SplitzUserDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof SplitzUserDto
     */
    userName: string;
    /**
     * 
     * @type {string}
     * @memberof SplitzUserDto
     */
    photo?: string | null;
    /**
     * 
     * @type {Array<FriendDto>}
     * @memberof SplitzUserDto
     */
    friends?: Array<FriendDto>;
    /**
     * 
     * @type {Array<Group>}
     * @memberof SplitzUserDto
     */
    groups?: Array<Group>;
    /**
     * 
     * @type {Array<GroupBalance>}
     * @memberof SplitzUserDto
     */
    balances?: Array<GroupBalance>;
}

/**
 * Check if a given object implements the SplitzUserDto interface.
 */
export function instanceOfSplitzUserDto(value: object): value is SplitzUserDto {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('userName' in value) || value['userName'] === undefined) return false;
    return true;
}

export function SplitzUserDtoFromJSON(json: any): SplitzUserDto {
    return SplitzUserDtoFromJSONTyped(json, false);
}

export function SplitzUserDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): SplitzUserDto {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'userName': json['userName'],
        'photo': json['photo'] == null ? undefined : json['photo'],
        'friends': json['friends'] == null ? undefined : ((json['friends'] as Array<any>).map(FriendDtoFromJSON)),
        'groups': json['groups'] == null ? undefined : ((json['groups'] as Array<any>).map(GroupFromJSON)),
        'balances': json['balances'] == null ? undefined : ((json['balances'] as Array<any>).map(GroupBalanceFromJSON)),
    };
}

export function SplitzUserDtoToJSON(json: any): SplitzUserDto {
    return SplitzUserDtoToJSONTyped(json, false);
}

export function SplitzUserDtoToJSONTyped(value?: SplitzUserDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'userName': value['userName'],
        'photo': value['photo'],
        'friends': value['friends'] == null ? undefined : ((value['friends'] as Array<any>).map(FriendDtoToJSON)),
        'groups': value['groups'] == null ? undefined : ((value['groups'] as Array<any>).map(GroupToJSON)),
        'balances': value['balances'] == null ? undefined : ((value['balances'] as Array<any>).map(GroupBalanceToJSON)),
    };
}

