USE Northwind
GO
/****** Object:  StoredProcedure [dbo].[spSelEntidad]    Script Date: 03/08/2016 05:26:29 p.m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[spSelEntidad]
AS

SELECT '[' + TABLE_NAME + ']'  AS  TABLE_NAME,TABLE_SCHEMA,ORDINAL_POSITION, '[' + COLUMN_NAME + ']'  AS  COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
--WHERE TABLE_SCHEMA='dbo'

--SELECT TABLE_NAME,TABLE_SCHEMA,CONSTRAINT_NAME
--FROM INFORMATION_SCHEMA.CONSTRAINT_TABLE_USAGE
----WHERE TABLE_NAME = 'Estatus' AND TABLE_NAME = 'Estatus'

----SELECT name, type_desc, is_unique, is_primary_key
----FROM sys.indexes
----WHERE [object_id] = OBJECT_ID('password_resets')

