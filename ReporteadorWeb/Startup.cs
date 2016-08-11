using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(ReporteadorWeb.Startup))]
namespace ReporteadorWeb
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
