USE [Northwind]
GO
/****** Object:  StoredProcedure [dbo].[spPrcGeneraReporte]    Script Date: 09/08/2016 03:34:24 p.m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[spPrcGeneraReporte]
@XMLDiagram AS XML,
@Top AS VARCHAR(10) = 10,
@EnXML BIT = 1
AS

SET NOCOUNT ON
SET ARITHABORT ON

If Exists (Select id From tempdb.DBO.SYSOBJECTS Where id=object_id(N'tempdb.dbo.#Entities'))  
	Drop Table #Entities
If Exists (Select id From tempdb.DBO.SYSOBJECTS Where id=object_id(N'tempdb.dbo.#EntitiesProperties'))  
	Drop Table #EntitiesProperties
If Exists (Select id From tempdb.DBO.SYSOBJECTS Where id=object_id(N'tempdb.dbo.#Joins'))  
	Drop Table #Joins
If Exists (Select id From tempdb.DBO.SYSOBJECTS Where id=object_id(N'tempdb.dbo.#JoinsDetail'))  
	Drop Table #JoinsDetail
If Exists (Select id From tempdb.DBO.SYSOBJECTS Where id=object_id(N'tempdb.dbo.#JoinsFilter'))  
	Drop Table #JoinsFilter
If Exists (Select id From tempdb.DBO.SYSOBJECTS Where id=object_id(N'tempdb.dbo.#Filters'))  
	Drop Table #Filters

DECLARE @SQLQuery AS NVARCHAR(MAX) = ''

CREATE TABLE #Joins(
	id int identity,
	entity VARCHAR(100),
	e VARCHAR(100),
	type VARCHAR(100)
)

SELECT	DISTINCT
		xml.node.value('../@name','VARCHAR(100)') entity
INTO	#Entities
FROM	@XMLDiagram.nodes('/root/e/p') as xml(node)

SELECT	CAST(ROW_NUMBER() OVER(PARTITION BY xml.node.value('@name','VARCHAR(100)') ORDER BY xml.node.value('@name','VARCHAR(100)')) AS VARCHAR) id,
		xml.node.value('../@name','VARCHAR(100)') entity,
		xml.node.value('@name','VARCHAR(100)') property
INTO	#EntitiesProperties
FROM	@XMLDiagram.nodes('/root/e/p') as xml(node)

INSERT INTO #Joins
SELECT	DISTINCT
		xml.node.value('../@name','VARCHAR(100)') entity,
		xml.node.value('@e','VARCHAR(100)') e,
		xml.node.value('@type','VARCHAR(100)') type
FROM	@XMLDiagram.nodes('/root/e/l') as xml(node)

SELECT	ROW_NUMBER() OVER (ORDER BY xml.node.value('../@name','VARCHAR(100)'), xml.node.value('@e','VARCHAR(100)')) AS id,
		xml.node.value('../@name','VARCHAR(100)') entity,
		xml.node.value('@e','VARCHAR(100)') e,
		xml.node.value('@type','VARCHAR(100)') type,
		xml.node.value('@p1','VARCHAR(100)') p1,
		xml.node.value('@p2','VARCHAR(100)') p2,
		xml.node.value('@condition','VARCHAR(100)') condition
INTO	#JoinsDetail
FROM	@XMLDiagram.nodes('/root/e/l') as xml(node)

SELECT	ROW_NUMBER() OVER (ORDER BY xml.node.value('../@name','VARCHAR(100)'), xml.node.value('@e','VARCHAR(100)')) AS id,
		xml.node.value('../@name','VARCHAR(100)') entity,
		xml.node.value('@e','VARCHAR(100)') e,
		xml.node.value('@type','VARCHAR(100)') type,
		xml.node.value('@p1','VARCHAR(100)') p1,
		xml.node.value('@p2','VARCHAR(100)') p2,
		xml.node.value('@condition','VARCHAR(100)') condition
INTO	#JoinsFilter
FROM	@XMLDiagram.nodes('/root/e/jf') as xml(node)

SELECT	ROW_NUMBER() OVER (ORDER BY xml.node.value('../@name','VARCHAR(100)'), xml.node.value('@e','VARCHAR(100)')) AS id,
		xml.node.value('../@name','VARCHAR(100)') entity,
		xml.node.value('@type','VARCHAR(100)') type,
		xml.node.value('@p','VARCHAR(100)') p,
		xml.node.value('@condition','VARCHAR(100)') condition,
		xml.node.value('@value','VARCHAR(100)') value
INTO	#Filters
FROM	@XMLDiagram.nodes('/root/e/f') as xml(node)

--SELECT * FROM #Filters

--SELECT
SELECT @SQLQuery = @SQLQuery +  entity + '.' + property + ' AS ' +  property + CASE WHEN id > 1 THEN id ELSE '' END + ',' FROM #EntitiesProperties

SELECT @SQLQuery = 'SELECT TOP(' + @TOP + ') ' + ISNULL(@SQLQuery,'*') + 'GETDATE() as _DatePrintReport'


--CREAR FROM
SELECT @SQLQuery = @SQLQuery + ' FROM '

DECLARE @I AS INT=1
DECLARE @MAX AS INT = (SELECT MAX(ID) FROM #Joins)

--CREAR JOINS
IF(@MAX IS NOT NULL)
	BEGIN

		WHILE @I<=@MAX
			BEGIN

				---JOIN
				SELECT 
							@SQLQuery =	@SQLQuery + 
										e.entity + ' ' + j.type + ' ' + j.e + ' ON '
				FROM		#EntitiesProperties e
				INNER JOIN	#Joins j 
				ON			e.entity=j.entity 
				WHERE		j.ID=@I
				GROUP BY	e.entity,j.type,j.e
				
				--ON
				SELECT 
							@SQLQuery =	@SQLQuery + 								
										jd.entity + '.' + jd.p1 +  jd.condition + jd.e + '.' + jd.p2 + ' AND '
				FROM		#Joins j
				JOIN		#JoinsDetail jd
				ON			j.entity=jd.entity AND j.e=jd.e AND j.type=jd.type
				WHERE		j.ID=@I


				SELECT 
							@SQLQuery =	@SQLQuery + ' 1=1'
		
				SET @I = @I+1	

			END
	END
ELSE
	BEGIN
		SELECT 
					@SQLQuery =	@SQLQuery + 
								e.entity + ','
		FROM		#Entities e

		SELECT		@SQLQuery =	@SQLQuery + '(SELECT 1 x) vwRmp'
	END


--CREAR WHERE
SELECT 
			@SQLQuery =	@SQLQuery + ' WHERE 1=1'

--FILTROS POR COMPARACION
SELECT 
			@SQLQuery =	ISNULL(@SQLQuery + 								
						' ' + jf.type + ' ' + jf.entity + '.' + jf.p1 +  jf.condition + jf.e + '.' + jf.p2,'')
FROM		#JoinsFilter jf

--FILTROS
SELECT 
			@SQLQuery =	ISNULL(@SQLQuery + 								
						' ' + f.type + ' ' + f.entity + '.' + f.p + ' '+   f.condition + ' ' + f.value ,'')
FROM		#Filters f

IF(@EnXML=1 OR @EnXML IS NULL)
	BEGIN

		declare @QUERY nvarchar(max), @RESULT xml

		set @QUERY = N'select @RESULT = (
			SELECT *
			FROM (
				' + @SQLQuery + '
			) row 
			FOR XML PATH(''row'')
		)'

		execute sp_executesql @QUERY, N'@RESULT xml output', @RESULT = @RESULT output

		IF(@EnXML IS NULL)
			SELECT dbo.FlattenedJSON ((select '<root>' +  CAST(@RESULT  AS nvarchar(MAX)) + '</root>')) JsonModel
		ELSE
			SELECT (select '<root>' +  CAST(@RESULT  AS nvarchar(MAX)) + '</root>') JsonModel
	END
ELSE
	EXEC(@SQLQuery)
	PRINT(@SQLQuery)

GO

declare @p3 xml
set @p3=convert(xml,N'<root><e name="dbo.Territories"><p name="TerritoryID"/><p name="TerritoryDescription"/><p name="RegionID"/></e></root>')
declare @p6 int
set @p6=NULL
exec sp_executesql N'EXEC @RETURN_VALUE = [dbo].[spPrcGeneraReporte] @XMLDiagram = @p0, @Top = @p1, @EnXML = @p2',N'@p0 xml,@p1 varchar(8000),@p2 bit,@RETURN_VALUE int output',@p0=@p3,@p1='50',@p2=1,@RETURN_VALUE=@p6 output
select @p6

IF OBJECT_ID (N'dbo.FlattenedJSON') IS NOT NULL
   DROP FUNCTION dbo.FlattenedJSON
GO

CREATE FUNCTION dbo.FlattenedJSON (@XMLResult XML)
RETURNS NVARCHAR(MAX)
WITH EXECUTE AS CALLER
AS
BEGIN
DECLARE  @JSONVersion NVARCHAR(MAX), @Rowcount INT
SELECT @JSONVersion = '', @rowcount=COUNT(*) FROM @XMLResult.nodes('/root/*') x(a)
SELECT @JSONVersion=@JSONVersion+
STUFF(
  (SELECT TheLine FROM 
    (SELECT ',
    {'+
      STUFF((SELECT ',"'+COALESCE(b.c.value('local-name(.)', 'NVARCHAR(255)'),'')+'":"'+
       REPLACE( --escape tab properly within a value
         REPLACE( --escape return properly
           REPLACE( --linefeed must be escaped
             REPLACE( --backslash too
               REPLACE(COALESCE(b.c.value('text()[1]','NVARCHAR(MAX)'),''),--forwardslash
               '\', '\\'),   
              '/', '\/'),   
          CHAR(10),'\n'),   
         CHAR(13),'\r'),   
       CHAR(09),'\t')   
     +'"'   
     FROM x.a.nodes('*') b(c) 
     FOR XML PATH(''),TYPE).value('(./text())[1]','NVARCHAR(MAX)'),1,1,'')+'}'
   FROM @XMLResult.nodes('/root/*') x(a)
   ) JSON(theLine)
  FOR XML PATH(''),TYPE).value('.','NVARCHAR(MAX)' )
,1,1,'')
IF @Rowcount>1 RETURN '['+@JSONVersion+'
]'
RETURN REPLACE(REPLACE(@JSONVersion, CHAR(13), ''), CHAR(10), '')
END

GO

--EXEC spPrcGeneraReporte
--@XMLDiagram =
--'
--	<e name="dbo.Recurso">
--		<p name="*"></p>
--		<f type="and" p="InternetId" condition="=" value="0" ></f>
--	</e>
--',
--@Top=50,
--@EnXML=1

--declare @p3 xml
--set @p3=convert(xml,N'<e name="dbo.Recurso"><p name="*"/><f type="and" p="InternetId" condition="=" value="0"/></e>')
--declare @p6 int
--set @p6=0
--exec sp_executesql N'EXEC @RETURN_VALUE = [dbo].[spPrcGeneraReporte] 
--@XMLDiagram = @p0, @TOP = @p1, @EnXML = @p2',N'@p0 xml,@p1 varchar(8000),@p2 bit,@RETURN_VALUE int output',
--@p0=@p3,@p1='10',@p2=1,@RETURN_VALUE=@p6 output
--select @p6