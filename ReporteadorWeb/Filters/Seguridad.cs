using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Linq;
using System.Configuration;
using ReporteadorWeb.Models.Seguridad;

namespace ReporteadorWeb.Filters
{
    public class Seguridad : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            var isAuthorized = false;

            if (httpContext.Request.IsAjaxRequest())
            {
                isAuthorized = true;

                if (httpContext.Session["UsuarioWeb"] == null)
                {
                    throw new Exception("La sesion expiró, refresque la pagina [F5]");
                }
            }
            else
            {
                var rd = httpContext.Request.RequestContext.RouteData;
                string accion = rd.GetRequiredString("action");
                string controlador = rd.GetRequiredString("controller");
                string vistaSolicitada = "~/" + controlador + "/" + accion;
                UsuarioWeb usuarioWeb = (UsuarioWeb)(httpContext.Session["UsuarioWeb"]) ?? ObtenerUsuario(); ;

                if (usuarioWeb != null)
                {
                    isAuthorized = usuarioWeb.UsuarioFunciones.Where(x => x.Url == vistaSolicitada).Count() > 0;
                }

                httpContext.Session["UsuarioWeb"] = usuarioWeb;
            }
            return isAuthorized;
        }


        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            if (filterContext.HttpContext.Session["UsuarioWeb"] != null)
            {
                filterContext.Result = new RedirectToRouteResult(
                    new RouteValueDictionary(
                        new
                        {
                            controller = "Home",
                            action = "NoAutorizado"
                        })
                    );
            }
            else {
                filterContext.Result = new RedirectToRouteResult(
                    new RouteValueDictionary(
                        new
                        {
                            controller = "Login",
                            action = "Index"
                        })
                    );

            }
        }

        protected void SetCachePolicy(AuthorizationContext filterContext)
        {
            // ** IMPORTANT **
            // Since we're performing authorization at the action level, 
            // the authorization code runs after the output caching module. 
            // In the worst case this could allow an authorized user 
            // to cause the page to be cached, then an unauthorized user would later 
            // be served the cached page. We work around this by telling proxies not to 
            // cache the sensitive page, then we hook our custom authorization code into 
            // the caching mechanism so that we have the final say on whether a page 
            // should be served from the cache.
            HttpCachePolicyBase cachePolicy = filterContext.HttpContext.Response.Cache;
            cachePolicy.SetProxyMaxAge(new TimeSpan(0));
            cachePolicy.AddValidationCallback(CacheValidationHandler, null /* data */);
        }

        public void CacheValidationHandler(HttpContext context,
                                            object data,
                                            ref HttpValidationStatus validationStatus)
        {
            validationStatus = OnCacheAuthorization(new HttpContextWrapper(context));
        }

        protected UsuarioWeb ObtenerUsuario()
        {
            UsuarioWeb usuarioWeb = new UsuarioWeb();
            string sistemaNombre = ConfigurationManager.AppSettings["NombreSistema"].ToString();

            Usuario usuario = new Usuario();

            usuarioWeb.Usuario = usuario;

            return usuarioWeb;
        }
    }
}