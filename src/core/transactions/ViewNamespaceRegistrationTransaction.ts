/**
 * 
 * Copyright 2020 Grégory Saive for NEM (https://nem.io)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {UInt64, NamespaceRegistrationType, NamespaceRegistrationTransaction} from 'nem2-sdk'

// internal dependencies
import {TransactionView} from './TransactionView'

/// region custom types
export type NamespaceRegistrationFormFieldsType = {
  rootNamespaceName: string
  subNamespaceName?: string,
  registrationType: NamespaceRegistrationType,
  duration?: number,
  maxFee: UInt64,
}
/// end-region custom types

export class ViewNamespaceRegistrationTransaction extends TransactionView<NamespaceRegistrationFormFieldsType> {
  /**
   * Fields that are specific to transfer transactions
   * @var {string[]}
   */
  protected readonly fields: string[] = [
    'rootNamespaceName',
    'namespaceRegistrationType',
    'subNamespaceName',
    'duration',
  ]

  /**
   * Parse form items and return a ViewNamespaceRegistrationTransaction
   * @param {NamespaceRegistrationFormFieldsType} formItems
   * @return {ViewNamespaceRegistrationTransaction}
   */
  public parse(formItems: NamespaceRegistrationFormFieldsType): ViewNamespaceRegistrationTransaction {
    // - instantiate new transaction view
    const view = new ViewNamespaceRegistrationTransaction(this.$store)

    // - parse form items to view values
    view.values.set('rootNamespaceName', formItems.rootNamespaceName)
    view.values.set('registrationType', formItems.registrationType)
    view.values.set('subNamespaceName', formItems.subNamespaceName || null)
    view.values.set('duration', formItems.duration ? UInt64.fromUint(formItems.duration) : null)

    // - set fee and return
    view.values.set('maxFee', formItems.maxFee)
    return view
  }

  /**
   * Use a transaction object and return a ViewNamespaceRegistrationTransaction
   * @param {NamespaceRegistrationTransaction} transaction
   * @return {ViewNamespaceRegistrationTransaction}
   */
  public use(transaction: NamespaceRegistrationTransaction): ViewNamespaceRegistrationTransaction {
    // - instantiate new transaction view
    const view = new ViewNamespaceRegistrationTransaction(this.$store)

    // - set transaction
    view.transaction = transaction

    // - populate common values
    view.initialize(transaction)

    // - read transaction fields
    if (NamespaceRegistrationType.RootNamespace === transaction.registrationType) {
      view.values.set('rootNamespaceName', transaction.namespaceName)
    }
    else {
      view.values.set('subNamespaceName', transaction.namespaceName)

      // - try to identify root namespace by id
      const parentId = transaction.parentId
      const namespaceNames = this.$store.getters['namespace/namespacesNames']
      if (namespaceNames.hasOwnProperty(parentId.toHex())) {
        view.values.set('rootNamespaceName', namespaceNames[parentId.toHex()])
      }
    }

    // - set type and duration
    view.values.set('registrationType', transaction.registrationType)
    view.values.set('duration', transaction.duration || null)
    return view
  }
}
