import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.mail.*;
import javax.mail.internet.*;
import javax.activation.*;
import java.util.Properties;

// Declaring a WebServlet called StarServlet, which maps to url "/api/star"
@WebServlet(name = "SubscribeServlet", urlPatterns = "/api/subscribe")
public class SubscribeServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("application/json"); // Response mime type
		response.setCharacterEncoding("UTF-8");
		response.setHeader("Access-Control-Allow-Origin", "*");

		// Retrieve parameter limit from url request.
		String email = request.getParameter("email");
		String key = request.getParameter("key");
		int hashCode = key!=null ? Integer.parseInt(key) : email.hashCode();

		// Output stream to STDOUT
		PrintWriter out = response.getWriter();

		try {
			Context initCtx = new InitialContext();

            Context envCtx = (Context) initCtx.lookup("java:comp/env");
            if (envCtx == null)
                throw new Exception("context is null");

            // Look up our data source
			DataSource dataSource = (DataSource) envCtx.lookup("jdbc/masterdb");
			
			// Get a connection from dataSource
			Connection dbcon = dataSource.getConnection();

			// Construct a update with parameter represented by "?"
			String update;
			if(key==null) 
				update = "insert into subscribe (activated, email, hashCode) values (?,?,?)";
			else
				update = "update subscribe set activated = ? where (email = ? and hashCode = ?)";

			// Declare our statement
			PreparedStatement statement = dbcon.prepareStatement(update);

			// Set the parameter represented by "?" in the update to the id we get from url,
			// num 1 indicates the first "?" in the update
			statement.setInt(1, key==null ? 0 : 1);
			statement.setString(2, email);
			statement.setInt(3, hashCode);

			// Perform the update
			if(statement.executeUpdate() > 0) {
				JsonObject jsonObject = new JsonObject();
				jsonObject.addProperty("status", true);

				// write JSON string to output
				out.write(jsonObject.toString());
				// set response status to 200 (OK)
				response.setStatus(200);
			} else {
				throw new Exception("Fail to subscribe! Please try again later or use another email!");
			}

			// Send confirmation email
			if(key == null) {
				String username = "hello@blockzone.com";
				String password = "Blockzone18!";

				Properties props = new Properties();
				props.put("mail.smtp.starttls.enable", "true");
				props.put("mail.smtp.host", "smtp-mail.outlook.com");

				Session session = Session.getInstance(props);
				MimeMessage msg = new MimeMessage(session);

				// set the message content here
				msg.setFrom(new InternetAddress(username, "NoReply"));
				msg.addRecipient(Message.RecipientType.TO,
						new InternetAddress(email, "Mr. Subscriber"));
				msg.setSubject("Blockzone Subscription Confirmation");
				msg.setText("Please use this link to confirm your subscription: \n http://167.99.238.182:8080/Blockzone/subscribe.html?email=" + email + "&key=" + hashCode);

				Transport.send(msg, username, password);
			}

			statement.close();
			dbcon.close();
		} catch (Exception e) {
			e.printStackTrace();
			// write error message JSON object to output
			JsonObject jsonObject = new JsonObject();
			jsonObject.addProperty("errorMessage", e.getMessage());
			out.write(jsonObject.toString());

			// set reponse status to 500 (Internal Server Error)
			response.setStatus(200);
		} 
		out.close();

	}

}
