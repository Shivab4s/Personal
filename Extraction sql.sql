

SELECT sum(Salesamount) as Sales, Sum(Totalproductcost) as Cost,
Count(distinct Salesordernumber) as Orders,CurrencyKey,
sum(salesorderlinenumber) as orderline,
sum(orderquantity) as Order_quantity,
sum(discountamount) as discount_amount,
Cast(CustomerKey as varchar(20))+cast(OrderDateKey as varchar(20)) as Customer_Order_key,
sum(taxamt) as taxamount,
sum(freight) as freightamount,
case when EnglishPromotionName<>'No Discount' then 0 else 1 end Discountflag,
case when Sum(Totalproductcost)< sum(Salesamount) then 1 else 0 end as neg_margin,
salesordernumber,
CAST(a.SalesOrderNumber AS VARCHAR(20))+CAST(a.ProductKey AS VARCHAR(20))+
	CAST(a.CustomerKey AS VARCHAR(20)) AS KEY_LINK ,
a.ProductKey,
CustomerKey,
a.PromotionKey,a.OrderDateKey,a.organization
a.DueDateKey,a.ShipDateKey,a.CustomerPONumber
FROM DBO.FactInternetSales a inner join 
dimdate b on a.OrderDateKey=b.DateKey inner join 
DimProduct c on a.ProductKey=c.ProductKey  inner join 
DimPromotion d on a.PromotionKey=d.PromotionKey
group by case when EnglishPromotionName<>'No Discount' then 0 else 1 end,a.ProductKey,
CustomerKey,a.PromotionKey,
a.DueDateKey,a.ShipDateKey,
salesordernumber,a.CustomerPONumber,a.OrderDateKey,Cast(CustomerKey as varchar(20))+cast(OrderDateKey as varchar(20)),CurrencyKey ;

Extraction Script:

Customer:
SQL
select distinct CustomerKey, 
Gender, datediff(Year,cast(BirthDate as DATE),CAST(format(getdate(),'yyyy-MM-dd') AS DATE)) as Age,
case when TotalChildren>0 then 'Family' else 'Single' end as family_flg,
City as Customercity,
CountryRegionCode as Customer_Region, 
PostalCode as Customer_postal,
case when CountryRegionCode='US' then 'Nationality' else 'Expat' end as Nationality
from dimcustomer a inner join DimGeography b 
on a.GeographyKey=b.GeographyKey


New_Repeat:
SQL 
WITH first_tran_date AS (
    SELECT MIN(orderdatekey) AS first_tran_date, CustomerKey 
    FROM dbo.FactInternetSales 
    GROUP BY CustomerKey
)

SELECT 
    a.OrderDateKey,
	a.SalesOrderNumber,
	a.CustomerKey,
	CASE 
        WHEN c.first_tran_date >= format(DATEADD(YEAR, DATEDIFF(YEAR, 0, format(CAST(cast(orderdatekey as varchar(20)) AS DATE),'yyyyMMdd')), 0),'yyyyMMdd')  THEN 'New Customer'
        ELSE 'Repeated Customer'
    END AS CustomerType_YoY,
CASE 
        WHEN c.first_tran_date >= format(DATEADD(MONTH, DATEDIFF(MONTH, 0, format(CAST(cast(orderdatekey as varchar(20)) AS DATE),'yyyyMMdd')), 0),'yyyyMMdd')  THEN 'New Customer'
        ELSE 'Repeated Customer'
    END AS CustomerType_Mom
FROM dbo.FactInternetSales a 
INNER JOIN DimCustomer b ON a.CustomerKey = b.CustomerKey
LEFT JOIN first_tran_date c ON a.CustomerKey = c.CustomerKey
;

