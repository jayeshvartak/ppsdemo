/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCheque = /* GraphQL */ `
  mutation CreateCheque(
    $input: CreateChequeInput!
    $condition: ModelChequeConditionInput
  ) {
    createCheque(input: $input, condition: $condition) {
      id
      payee
      amountWord
      amountNumber
      chequeDate
      chequeNumber
      image
      status
      createdAt
      updatedAt
    }
  }
`;
export const updateCheque = /* GraphQL */ `
  mutation UpdateCheque(
    $input: UpdateChequeInput!
    $condition: ModelChequeConditionInput
  ) {
    updateCheque(input: $input, condition: $condition) {
      id
      payee
      amountWord
      amountNumber
      chequeDate
      chequeNumber
      image
      status
      createdAt
      updatedAt
    }
  }
`;
export const deleteCheque = /* GraphQL */ `
  mutation DeleteCheque(
    $input: DeleteChequeInput!
    $condition: ModelChequeConditionInput
  ) {
    deleteCheque(input: $input, condition: $condition) {
      id
      payee
      amountWord
      amountNumber
      chequeDate
      chequeNumber
      image
      status
      createdAt
      updatedAt
    }
  }
`;
