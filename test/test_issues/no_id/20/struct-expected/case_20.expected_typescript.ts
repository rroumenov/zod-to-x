import * as CASE_20_DOMAIN from "./case_20_domain";

export interface Usage {
    itemBox: CASE_20_DOMAIN.ItemBox;
    strBox: CASE_20_DOMAIN.StrBox;
    sortBox: CASE_20_DOMAIN.SortBox;
    itemPair: CASE_20_DOMAIN.ItemPair;
    pairs: CASE_20_DOMAIN.ItemPair[];
    message: CASE_20_DOMAIN.AnyMessage;
}

