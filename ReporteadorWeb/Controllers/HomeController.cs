using Newtonsoft.Json;
using ReporteadorWeb.Filters;
using ReporteadorWeb.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Xml;
using System.Xml.Linq;
using CodeEngine.Framework.QueryBuilder;
using CodeEngine.Framework.QueryBuilder.Enums;
using ReporteadorWeb.Modelo;
using System.Data;

namespace Reporteador.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult dialogEditarCampos()
        {
            return PartialView();
        }

        [ErrorHandlerJson]
        public JsonResult ObtenerTablas()
        {

            DatabaseAdoNet ado = new DatabaseAdoNet();
            var sql = "SELECT '[' + TABLE_NAME + ']'  AS  TABLE_NAME,TABLE_SCHEMA,ORDINAL_POSITION, '[' + COLUMN_NAME + ']'  AS  COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS";

            var json = ado.ExecQuery(sql).AsEnumerable().Select(s => new {
                TABLE_NAME = s["TABLE_NAME"],
                TABLE_SCHEMA = s["TABLE_SCHEMA"],
                ORDINAL_POSITION = s["ORDINAL_POSITION"],
                COLUMN_NAME = s["COLUMN_NAME"],
                DATA_TYPE = s["DATA_TYPE"],
                CHARACTER_MAXIMUM_LENGTH = s["CHARACTER_MAXIMUM_LENGTH"],
                IS_NULLABLE = s["IS_NULLABLE"]
            }).ToList(); ;

            return Json(json, JsonRequestBehavior.AllowGet);

            //using (var data = ReporteadorWeb.Modelo.DatabaseContext.GetDataContext())
            //{
            //    var query = data.spSelEntidad().Select(s => new {
            //        TABLE_NAME = s.TABLE_NAME,
            //        TABLE_SCHEMA = s.TABLE_SCHEMA,
            //        ORDINAL_POSITION = s.ORDINAL_POSITION,
            //        COLUMN_NAME = s.COLUMN_NAME,
            //        DATA_TYPE = s.DATA_TYPE,
            //        CHARACTER_MAXIMUM_LENGTH = s.CHARACTER_MAXIMUM_LENGTH,
            //        IS_NULLABLE = s.IS_NULLABLE,
            //    }).ToList();

            //    return Json(query, JsonRequestBehavior.AllowGet);
            //}
        }

        [ErrorHandlerJson]
        public JsonResult EjecutarConsultaSP(EntityER[] entities) {
            var Entidades = entities.Where(e=> e.type=="TableShape").ToList();

            XElement xml = new XElement("root",
                entities.Where(e => e.type == "TableShape").Select(e =>
                 new XElement("e",
                            new XAttribute("name", e.name),
                            e.entities.Select(p => new XElement("p", new XAttribute("name", p.text))),
                            entities.Where(e2 => e2.type == "draw2d.Connection" && e2.sourceNode==e.id).Select(e2 =>
                             new XElement("l",
                                        new XAttribute("type", "inner join"),
                                        new XAttribute("e", Entidades.Where(en => e2.targetNode == en.id).FirstOrDefault().name),
                                        new XAttribute("p1", Entidades.Where(en => e2.targetNode == en.id).FirstOrDefault().entities.Where(pr => "input_" + pr.id.ToString() == e2.targetPort).FirstOrDefault().text),
                                        new XAttribute("p2", Entidades.Where(en => e2.sourceNode == en.id).FirstOrDefault().entities.Where(pr => "output_" + pr.id.ToString() == e2.sourcePort).FirstOrDefault().text),
                                        new XAttribute("condition", "=")
                                    )
                                )
                        )
                    )
                );

            using (var data = ReporteadorWeb.Modelo.DatabaseContext.GetDataContext())
            {
                var query = data.spPrcGeneraReporte(xml, "50", true).FirstOrDefault();               

                if (query.JsonModel!=null)
                {
                    XmlDocument doc = new XmlDocument();

                    doc.LoadXml(query.JsonModel);

                    var json = JsonConvert.SerializeXmlNode(doc);

                    return Json(json, JsonRequestBehavior.AllowGet);
                }
                else {
                    return Json(new Respuesta { Error=true, Mensaje="Sin registros para mostrar"}, JsonRequestBehavior.AllowGet);
                }
            }
        }

        [ErrorHandlerJson]
        public JsonResult EjecutarConsulta(EntityER[] entities)
        {
            var Entidades = entities.Where(e => e.type == "TableShape").ToList();
            var Joins = entities.Where(e => e.type == "draw2d.Connection").ToList();
            var Wheres = entities.Where(e => e.type == "filter").ToList();

            SelectQueryBuilder query = new SelectQueryBuilder();

            query.TopRecords = 50;

            query.SelectFromTable(Entidades.Select(e => e.name).FirstOrDefault().ToString());

            List<string> columnas = new List<string>();
            foreach (EntityER e in Entidades)
            {
                columnas.AddRange(e.entities.Select(p => e.name + '.' + p.text).ToArray());
            }

            query.SelectColumns(columnas.ToArray());

            foreach (EntityER j in Joins) {
                query.AddJoin(JoinType.InnerJoin,
                              Entidades.Where(en => j.targetNode == en.id).FirstOrDefault().name,
                              Entidades.Where(en => j.targetNode == en.id).FirstOrDefault().entities.Where(pr => "input_" + pr.id.ToString() == j.targetPort).FirstOrDefault().text,
                              Comparison.Equals,
                              Entidades.Where(en => j.sourceNode == en.id).FirstOrDefault().name,
                              Entidades.Where(en => j.sourceNode == en.id).FirstOrDefault().entities.Where(pr => "output_" + pr.id.ToString() == j.sourcePort).FirstOrDefault().text);
            }


            //query.AddWhere("Customers.City", Comparison.Equals, "London");


            DatabaseAdoNet ado = new DatabaseAdoNet();
            var sql = query.BuildQuery();
            var json = ado.ConvertDataTabletoString(ado.ExecQuery(sql));

            List<UserData> headers = new List<UserData>();
            foreach (EntityER e in Entidades)
            {
                headers.AddRange(e.userData);
            }

            return Json(new { json = json, headers = headers } , JsonRequestBehavior.AllowGet);
        }

        protected override JsonResult Json(object data, string contentType, System.Text.Encoding contentEncoding, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = contentType,
                ContentEncoding = contentEncoding,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }

    }
}
