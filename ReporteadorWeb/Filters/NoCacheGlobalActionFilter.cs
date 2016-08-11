using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ReporteadorWeb.Filters
{
    public class NoCacheGlobalActionFilter : ActionFilterAttribute
    {
        public override void OnResultExecuted(ResultExecutedContext filterContext)
        {           
            HttpCachePolicyBase cache = filterContext.HttpContext.Response.Cache;
            cache.SetCacheability(HttpCacheability.NoCache);
            cache.AppendCacheExtension("no-store, must-revalidate, private");

            base.OnResultExecuted(filterContext);
        }
    }
}