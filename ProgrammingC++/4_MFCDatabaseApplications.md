---
title: MFC Database applications
nav_order: 4
parent: Programming in C++
---

# MFC Database applications

This article demonstrates the main aspects involved to building Windows database applications with MVS using MFC (Microsoft Foundation Classes).

## SQL Server 2005

Given the time at which SQL Sever 2005 was applied for MVS 2005, there are a few differences compared to more modern implementations of SQL. All SQL queries discussed here return `recordsets`.

```sql
SELECT * FROM tableName;

SELECT colA, colB FROM tableName;

-- the following are equivalent and required for column names with whitespace; the latter preferred with C++ strings
SELECT "column A", "column B" FROM tableName;
SELECT [column A], [column B] FROM tableName;
```

The `WHERE` keyword is applied as follows:

```sql
SELECT * FROM tableName WHERE [Column C] = 1 AND [Column D] > 0.5;
```

There is no `JOIN` keyword with this level of SQL but join queries with specific fields can be performed as follows:

```sql
SELECT * FROM tableOne, tableTwo WHERE tableOne.[column A ID] = tableTwo.[column Z ID];
```

One can sort records by ordering:

```sql
SELECT * FROM tableOne WHERE colA.status = 'someString'
```

## Database support

MVS 2005 supports

+ __OLE DB__ - an Object-Linking and Embedding database accessed via COM (ActiveX); can be hosted locally or remotely and is generally more optimal without the MFC overhead
+ __ODBC__ - an Open DataBase Connectivity implementation; a standard function orientated interface that support a number of database vendors inc. SQL Server 2005 through __ODBC drivers__

MFC supports ODBC primarily through the following classes:

+ CDatabase - represents database connections
+ CRecordset - represents the object returned from `SELECT` queries, supporting navigation through the set
+ CRecordView - represents the object (typically a dialog box) that displays the current information from the recordset instance
+ CFieldExchange - provides functions that exchange data between the database and recordset object; tends to be used only if custom data types for fields are involved
+ CDBException - handles exceptions that occur from ODBC operations

## Registering an ODBC database

From the Windows Control Panel or Administrative Tools is the _Data source (ODBC)_ option. With SQL Server 2005 already installed, one can set up a local database as shown:

![](./MSVC2005/sql_sever_setup.PNG)

Note that the server name was updated to _(local)\SQLEXPRESS_ to match that of the default SQL Server service as shown.
