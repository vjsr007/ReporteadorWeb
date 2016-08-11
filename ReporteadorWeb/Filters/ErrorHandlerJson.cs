using System.Web.Mvc;
using ReporteadorWeb.Models;

namespace ReporteadorWeb.Filters
{
    public class ErrorHandlerJson : FilterAttribute, IExceptionFilter
    {
        public void OnException(ExceptionContext filterContext)
        {
            filterContext.ExceptionHandled = true;

            filterContext.Result = new JsonResult
            {
                Data = new Respuesta { Error = true, Mensaje = filterContext.Exception.Message  },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }
}